import { Buffer } from "buffer";

import { AnchorProvider, BN, BorshCoder, EventParser, Program, setProvider, workspace } from "@coral-xyz/anchor";
import {
  Keypair,
  ParsedAccountData,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionSignature
} from '@solana/web3.js';

import { createMint, getAssociatedTokenAddressSync, mintTo, NATIVE_MINT } from "@solana/spl-token";

import { AmbSolBridge } from "../../target/types/amb_sol_bridge";
import { receiveSigner, receiveSigners, sendSigner, signMessage } from "../../src/backend/signs";
import {
  AMB_CHAIN_ID,
  getBridgeStateAccount,
  getBridgeTokenAccounts,
  getOrCreateUserATA,
  getUserNoncePda,
  hexToUint8Array,
  initializeToken,
  numberToUint8Array,
  SOLANA_CHAIN_ID
} from "../../src/sdk/utils";
import { ReceivePayload, SendPayload, serializeReceivePayload, serializeSendPayload } from "../../src/backend/types";
import { verifySignatureInstruction } from "../../src/sdk/ed25519_ix";

import { expect, use } from "chai";
import chaiAsPromised from 'chai-as-promised';
import { unwrapWSolInstruction, wrapSolInstructions } from "../../src/sdk/wsol_ix";

use(chaiAsPromised);


describe("my-project", () => {
  // Configure the client to use the local cluster.
  setProvider(AnchorProvider.local());

  const program = workspace.AmbSolBridge as Program<AmbSolBridge>;
  const bridgeProgram = program;
  const connection = program.provider.connection;

  const admin = Keypair.generate();
  const user = Keypair.generate();

  // pda - account to store some data
  // ata - associated token account - storing tokens (one per user per token)
  // mint - a.k.a. token


  let tokenMint1: Keypair;        // some token (bridge CAN'T mint)
  let tokenMint2: Keypair;        // some token (bridge CAN mint)


  const ambTokenAddress1_ = "0x0000000000000000000000000000000000001111";
  const ambTokenAddress2_ = "0x0000000000000000000000000000000000002222";
  const ambTokenAddress3_ = "0x0000000000000000000000000000000000003333";
  const ambUserAddress_ = "0x000000000000000000000000000000000000aaaa";

  const ambTokenAddress1 = hexToUint8Array(ambTokenAddress1_);
  const ambTokenAddress2 = hexToUint8Array(ambTokenAddress2_);
  const ambTokenAddress3 = hexToUint8Array(ambTokenAddress3_);
  const ambUserAddress = hexToUint8Array(ambUserAddress_);


  it("airdropping sol", async () => {

    console.log("Admin's wallet address is : ", admin.publicKey.toBase58())
    console.log("User's wallet address is : ", user.publicKey.toBase58())

    await requestSol(admin, connection);
    await requestSol(user, connection);
  })


  it("initializing global state", async () => {
    await program.methods.initialize(sendSigner.publicKey, receiveSigner).accounts({ admin: admin.publicKey, }).signers([admin]).rpc();

    const globalState = await program.account.globalState.fetch(getBridgeStateAccount(program.programId));
    expect(+globalState.nonce).to.eq(0);
    expect(globalState.admin.equals(admin.publicKey));
    expect(globalState.sendSigner.equals(sendSigner.publicKey));
    expect(globalState.receiveSigner.equals(receiveSigner));
    expect(globalState.pause).to.eq(false);

  });


  it("initializing global state second time - should fail", async () => {
    await expect(
      program.methods.initialize(sendSigner.publicKey, receiveSigner)
        .accounts({ admin: admin.publicKey, }).signers([admin]).rpc()
    ).to.be.rejectedWith("already in use");

    // also try with another state account - should fail
    const someAccount = Keypair.generate();
    await expect(
      program.methods.initialize(sendSigner.publicKey, receiveSigner)
        .accountsPartial({ admin: admin.publicKey, state: someAccount.publicKey }).signers([admin]).rpc()
    ).to.be.rejectedWith("A seeds constraint was violated.");


  });


  it("initializing tokens", async () => {
    [tokenMint1, tokenMint2] = [Keypair.generate(), Keypair.generate()];


    await createMint(connection, admin, admin.publicKey, null, 6, tokenMint1);

    const [bridgeToken2PDA] = getBridgeTokenAccounts(tokenMint2.publicKey, program.programId);
    await createMint(connection, admin, bridgeToken2PDA, null, 6, tokenMint2);  // mint authority is token PDA


    // initialize token 1 - primary (non-mintable)
    await initializeToken(program, admin, tokenMint1.publicKey, ambTokenAddress2_, 18, false);
    await initializeToken(program, admin, tokenMint1.publicKey, ambTokenAddress1_, 18, false);
    // initialize token 2 - synthetic (mintable)
    await initializeToken(program, admin, tokenMint2.publicKey, ambTokenAddress2_, 18, true);
    // initialize token 3 - wrapped native
    await initializeToken(program, admin, NATIVE_MINT, ambTokenAddress3_, 18, false);


    const checkToken = async (pubkey: PublicKey, ambAddress: Uint8Array, isMintable: boolean) => {
      const [bridge_token_pda, bridgeATA] = getBridgeTokenAccounts(pubkey, program.programId);
      const tokenConfigState = await program.account.tokenConfig.fetch(bridge_token_pda);
      const bridgeAtaParsed = await connection.getParsedAccountInfo(bridgeATA);

      expect(tokenConfigState.token.equals(pubkey));
      expect(tokenConfigState.ambToken).to.deep.eq([...ambAddress]);
      expect(tokenConfigState.isMintable).to.eq(isMintable);

      if (isMintable) {
        // ATA not created for mintable tokens
        expect(bridgeAtaParsed.value).to.eq(null);
      } else {
        const bridgeAtaParsedInfo = (bridgeAtaParsed.value.data as ParsedAccountData).parsed.info;
        expect(bridgeAtaParsedInfo.state).to.eq("initialized");
        expect(bridgeAtaParsedInfo.owner).to.eq(bridge_token_pda.toBase58());

        expect(bridgeAtaParsedInfo.mint).to.eq(pubkey.toBase58());
        const tokenBalanceB = await connection.getTokenAccountBalance(bridgeATA);
        expect(tokenBalanceB.value.amount).to.eq('0');
      }

    }
    await checkToken(tokenMint1.publicKey, ambTokenAddress1, false);
    await checkToken(tokenMint2.publicKey, ambTokenAddress2, true);
    await checkToken(NATIVE_MINT, ambTokenAddress3, false);

  });


  it('send non mintable token', async () => {
    const userFrom = user;
    const tokenFrom = tokenMint1.publicKey;
    const userTo = ambUserAddress;
    const tokenTo = ambTokenAddress1;


    // mint some tokens to user
    const userATA = await getOrCreateUserATA(connection, userFrom, tokenFrom);
    await mintTokens(tokenFrom, userATA, 10 * 10 ** 6);
    expect((await connection.getTokenAccountBalance(userATA)).value.amount).to.eq('10000000');

    const before = await getStateSnapshot(tokenFrom, userFrom.publicKey);

    await commonSend(user, tokenFrom, userTo, tokenTo, 50);
    const after = await getStateSnapshot(tokenFrom, userFrom.publicKey);

    expect(after.token.user).to.eq(before.token.user - 50);
    expect(after.token.bridge).to.eq(before.token.bridge + 50);
    expect(after.native.user).to.eq(before.native.user - 20);
    expect(after.native.bridge).to.eq(before.native.bridge + 20);
    expect(after.sendNonce).to.eq(before.sendNonce + 1);
  });


  it('receive non mintable token', async () => {

    const tokenTo = tokenMint1.publicKey;
    const userTo = user;

    const before = await getStateSnapshot(tokenTo, userTo.publicKey);

    await commonReceive(userTo, tokenTo, 50, before.receiverNonce ?? 0);

    const after = await getStateSnapshot(tokenTo, userTo.publicKey);

    expect(after.token.user).to.eq(before.token.user + 50);
    expect(after.token.bridge).to.eq(before.token.bridge - 50);
    expect(after.native.user).to.be.lessThan(before.native.user);  // rent for nonce account
    expect(after.native.bridge).to.eq(before.native.bridge);
    expect(before.receiverNonce).to.eq(undefined);     // nonce account is not created yet; bridge will create nonce account for user on first receive
    expect(after.receiverNonce).to.eq(1);
  });


  it('receive mintable token', async () => {

    const tokenTo = tokenMint2.publicKey;
    const userTo = user;

    const before = await getStateSnapshot(tokenTo, userTo.publicKey);

    await commonReceive(userTo, tokenTo, 50, before.receiverNonce, true);

    const after = await getStateSnapshot(tokenTo, userTo.publicKey);

    expect(before.token.user).to.eq(undefined);  // expecting that bridge will create ATA for user
    expect(after.token.user).to.eq(50);
    expect(before.token.bridge).to.eq(undefined);  // bridge ATA for mintable tokens doesn't exist
    expect(after.token.bridge).to.eq(undefined);
    expect(after.native.user).to.be.lessThan(before.native.user);  // rent for ATA
    expect(after.native.bridge).to.eq(before.native.bridge);
    expect(after.receiverNonce).to.eq(before.receiverNonce + 1);

  });


  it('send mintable token', async () => {

    const userFrom = user;
    const tokenFrom = tokenMint2.publicKey;
    const userTo = ambUserAddress;
    const tokenTo = ambTokenAddress2;

    const before = await getStateSnapshot(tokenFrom, userFrom.publicKey);

    await commonSend(userFrom, tokenFrom, userTo, tokenTo, 50, true);

    const after = await getStateSnapshot(tokenFrom, userFrom.publicKey);

    expect(after.token.user).to.eq(before.token.user - 50);
    expect(before.token.bridge).to.eq(undefined);  // bridge ATA for mintable tokens doesn't exist
    expect(after.token.bridge).to.eq(undefined);
    expect(after.native.user).to.eq(before.native.user - 20);
    expect(after.native.bridge).to.eq(before.native.bridge + 20);


    expect(after.sendNonce).to.eq(before.sendNonce + 1);
  });


  it('send native', async () => {
    const userFrom = user;
    const tokenFrom = NATIVE_MINT;
    const userTo = ambUserAddress;
    const tokenTo = ambTokenAddress3;

    const before = await getStateSnapshot(tokenFrom, userFrom.publicKey);

    const transferNativeInstructions = await wrapSolInstructions(connection, userFrom, 1000 * 10 ** 9);
    await commonSend(userFrom, tokenFrom, userTo, tokenTo, 1000 * 10 ** 9, false, transferNativeInstructions);

    const after = await getStateSnapshot(tokenFrom, userFrom.publicKey);

    expect(before.token.user).to.eq(undefined);
    expect(after.token.user).to.eq(0);
    expect(after.token.bridge).to.eq(before.token.bridge + 1000 * 10 ** 9);
    expect(after.native.user).to.be.lessThan(before.native.user - 1000 * 10 ** 9 - 20);  // rent for wsol ATA
    expect(after.native.bridge).to.eq(before.native.bridge + 20);


    expect(after.sendNonce).to.eq(before.sendNonce + 1);

  });


  it('receive native', async () => {

    const tokenTo = NATIVE_MINT;
    const userTo = user;

    const before = await getStateSnapshot(tokenTo, userTo.publicKey);

    await commonReceive(userTo, tokenTo, 500 * 10 ** 9, before.receiverNonce);

    const after = await getStateSnapshot(tokenTo, userTo.publicKey);

    expect(after.token.user).to.eq(before.token.user + 500 * 10 ** 9);
    expect(after.token.bridge).to.eq(before.token.bridge - 500 * 10 ** 9);
    expect(after.native.user).to.be.eq(before.native.user);
    expect(after.native.bridge).to.eq(before.native.bridge);
    expect(after.receiverNonce).to.eq(before.receiverNonce + 1);
  });

  it('receive native and unwrap', async () => {

    const tokenTo = NATIVE_MINT;
    const userTo = user;

    const before = await getStateSnapshot(tokenTo, userTo.publicKey);

    await commonReceive(userTo, tokenTo, 500 * 10 ** 9, before.receiverNonce, false, true);

    const after = await getStateSnapshot(tokenTo, userTo.publicKey);

    expect(after.token.user).to.eq(undefined);
    expect(after.token.bridge).to.eq(before.token.bridge - 500 * 10 ** 9);
    expect(after.native.user - before.native.user).to.be.greaterThanOrEqual(450 * 10 ** 9);
    expect(after.native.bridge).to.eq(before.native.bridge);
    expect(after.receiverNonce).to.eq(before.receiverNonce + 1);
  });

  it("receive native to non-existing ata", async () => {

    const userFrom = user;
    const tokenFrom = NATIVE_MINT;
    const userToAmb = ambUserAddress;
    const tokenToAmb = ambTokenAddress3;

    const transferNativeInstructions = await wrapSolInstructions(connection, userFrom, 500 * 10 ** 9);
    await commonSend(userFrom, tokenFrom, userToAmb, tokenToAmb, 500 * 10 ** 9, false, transferNativeInstructions);


    const tokenTo = NATIVE_MINT;
    const userTo = Keypair.generate();
    await requestSol(userTo, connection, 10 ** 9);

    await commonReceive(userTo, tokenTo, 500 * 10 ** 9, 0, false, true);
    const after = await getStateSnapshot(tokenTo, userTo.publicKey);
    expect(after.token.user).to.eq(undefined);
    expect(after.native.user).to.be.greaterThanOrEqual(500 * 10 ** 9);
  });

  it("pause", async () => {
    let state = await program.account.globalState.fetch(getBridgeStateAccount(program.programId));
    expect(state.pause).to.eq(false);

    await bridgeProgram.methods.setPause(true).accountsPartial({ admin: admin.publicKey, }).signers([admin]).rpc();
    state = await program.account.globalState.fetch(getBridgeStateAccount(program.programId));
    expect(state.pause).to.eq(true);

    // dunno why, error message not parsed well, so "6005" instead of "Bridge is paused"

    await expect(
      commonSend(user, tokenMint1.publicKey, ambUserAddress, ambTokenAddress1, 50)
    ).to.be.rejectedWith("6005");

    await expect(
      commonReceive(user, tokenMint1.publicKey, 50, 0)
    ).to.be.rejectedWith("6005");

    await bridgeProgram.methods.setPause(false).accountsPartial({ admin: admin.publicKey, }).signers([admin]).rpc()
    state = await program.account.globalState.fetch(getBridgeStateAccount(program.programId));
    expect(state.pause).to.eq(false);

  });


  it("withdraw fees", async () => {
    const before = await getStateSnapshot(tokenMint1.publicKey, admin.publicKey);
    await program.methods.withdrawFees(new BN(50)).accounts({ admin: admin.publicKey, }).signers([admin]).rpc();
    const after = await getStateSnapshot(tokenMint1.publicKey, admin.publicKey);
    expect(after.native.bridge).to.eq(before.native.bridge - 50);
    expect(after.native.user).to.eq(before.native.user + 50);


  });


  describe('should fail', () => {


    it('receive with wrong nonce', async () => {
      await expect(
        commonReceive(user, tokenMint1.publicKey, 50, 123456)
      ).to.be.rejectedWith("Invalid nonce");
    });

    describe('call admin methods with non-admin account', () => {

      it("initialize token", async () => {
        await expect(
          initializeToken(program, user, tokenMint1.publicKey, ambTokenAddress1_, 18, true)
        ).to.be.rejectedWith("Not an admin");
      });

      it("pause", async () => {
        await expect(
          bridgeProgram.methods.setPause(true).accountsPartial({ admin: user.publicKey, }).signers([user]).rpc()
        ).to.be.rejectedWith("Not an admin");
      });

      it("withdraw fees", async () => {
        await expect(
          bridgeProgram.methods.withdrawFees(new BN(50)).accountsPartial({ admin: user.publicKey, }).signers([user]).rpc()
        ).to.be.rejectedWith("Not an admin");
      });


    });


    it("initialize mintable token with non-null bridge token account", async () => {
      const mint = Keypair.generate();
      const [bridgeTokenPDA] = getBridgeTokenAccounts(mint.publicKey, program.programId);
      await createMint(connection, admin, bridgeTokenPDA, null, 6, mint);  // mint authority is token PDA
      await expect(
        bridgeProgram.methods.initializeToken([...ambTokenAddress1], 18, true).accountsPartial({
          admin: admin.publicKey,
          mint: mint.publicKey,
        }).signers([admin]).rpc()
      ).to.be.rejectedWith("A require expression was violated.");
    });


    it("initialize mintable token with mint authority != bridge token pda", async () => {
      const mint = Keypair.generate();
      await createMint(connection, admin, admin.publicKey, null, 6, mint);  // mint authority is NOT token PDA
      await expect(
        initializeToken(program, admin, mint.publicKey, ambTokenAddress1_, 18, true)
      ).to.be.rejectedWith("A require expression was violated.");
    })

    it("send/receive with non registered token", async () => {
      const mint = Keypair.generate();
      await createMint(connection, admin, admin.publicKey, null, 6, mint);  // mint authority is NOT token PDA

      await expect(
        commonSend(user, mint.publicKey, ambUserAddress, ambTokenAddress1, 50)
      ).to.be.rejectedWith("The program expected this account to be already initialized.");
      await expect(
        commonReceive(user, mint.publicKey, 50, 0)
      ).to.be.rejectedWith("The program expected this account to be already initialized.");
    })


    it("send when user don't have tokens", async () => {
      const mint = Keypair.generate();
      await createMint(connection, admin, admin.publicKey, null, 6, mint);
      await initializeToken(program, admin, mint.publicKey, ambTokenAddress1_, 18, false);
      // mint some tokens to user
      const userATA = await getOrCreateUserATA(connection, user, mint.publicKey);
      await mintTokens(mint.publicKey, userATA, 1);

      await expect(
        commonSend(user, mint.publicKey, ambUserAddress, ambTokenAddress1, 50)
      ).to.be.rejectedWith("insufficient funds");
    })

    it("receive when bridge doesn't have tokens", async () => {
      const mint = Keypair.generate();
      await createMint(connection, admin, admin.publicKey, null, 6, mint);
      await initializeToken(program, admin, mint.publicKey, ambTokenAddress1_, 18, false);
      // mint some tokens to user and send them to bridge to initialize bridge ATA
      const userATA = await getOrCreateUserATA(connection, user, mint.publicKey);
      await mintTokens(mint.publicKey, userATA, 10);
      await commonSend(user, mint.publicKey, ambUserAddress, ambTokenAddress1, 10)


      const expectedNonce = +(await program.account.nonceAccount.fetch(getUserNoncePda(user.publicKey, program.programId))).nonceCounter;
      await expect(
        commonReceive(user, mint.publicKey, 50, expectedNonce)
      ).to.be.rejectedWith("insufficient funds");
    })


    it("send when not enough sol for fees", async () => {
      const userFrom = Keypair.generate();
      await requestSol(userFrom, connection, 10 ** 9);

      const mint = Keypair.generate();
      await createMint(connection, admin, admin.publicKey, null, 6, mint, { commitment: 'confirmed' });
      await initializeToken(program, admin, mint.publicKey, ambTokenAddress1_, 18, false);
      const userATA = await getOrCreateUserATA(connection, userFrom, mint.publicKey);
      await mintTokens(mint.publicKey, userATA, 10);

      await expect(
        commonSend(userFrom, mint.publicKey, ambUserAddress, ambTokenAddress1, 10, false, [], 10 ** 10)
      ).to.be.rejectedWith("insufficient lamports");
    })


    describe("wrong signature", () => {


      it("send", async () => {
        const tokenFrom = tokenMint1.publicKey;
        const userFrom = user;
        const userTo = ambUserAddress;
        const tokenTo = ambTokenAddress1;
        const amountToSend = 50;

        const value: SendPayload = {
          tokenAddressFrom: tokenFrom.toBytes(),
          tokenAddressTo: tokenTo,
          amountToSend,
          feeAmount: 20,
          chainFrom: SOLANA_CHAIN_ID,
          chainTo: AMB_CHAIN_ID,
          timestamp: Date.now(),
          flags: new Uint8Array(32),
          flagData: new Uint8Array(0),
        };

        const payload = serializeSendPayload(value);

        const sendInstruction = await bridgeProgram.methods.send(payload, [...userTo]).accountsPartial({
          sender: userFrom.publicKey,
          mint: tokenFrom,
        }).signers([userFrom]).instruction();

        // send without signature
        await expect(
          (async () => {
            const tx = new Transaction().add(sendInstruction);
            tx.feePayer = userFrom.publicKey;
            await sendAndConfirmTransaction(connection, tx, [userFrom], { commitment: 'confirmed' });
          })()
        ).to.be.rejectedWith("The arguments provided to a program instruction were invalid");

        // send with wrong instruction
        await expect(
          (async () => {
            const tx = new Transaction().add(unwrapWSolInstruction(userFrom.publicKey), sendInstruction);
            tx.feePayer = userFrom.publicKey;
            await sendAndConfirmTransaction(connection, tx, [userFrom], { commitment: 'confirmed' });
          })()
        ).to.be.rejectedWith("Signature invalid");

        // send with wrong signature
        await expect(
          (async () => {
            const signature = signMessage(serializeSendPayload({ ...value, chainTo: 123 }), [sendSigner]);
            const verifyInstruction = verifySignatureInstruction(signature);
            const tx = new Transaction().add(verifyInstruction, sendInstruction);
            tx.feePayer = userFrom.publicKey;
            await sendAndConfirmTransaction(connection, tx, [userFrom], { commitment: 'confirmed' });
          })()
        ).to.be.rejectedWith("Signature invalid");

        // send with wrong mint account
        await expect(
          (async () => {
            const signature = signMessage(serializeSendPayload(value), [sendSigner]);
            const verifyInstruction = verifySignatureInstruction(signature);
            const sendInstruction = await bridgeProgram.methods.send(payload, [...userTo]).accountsPartial({
              sender: userFrom.publicKey,
              mint: NATIVE_MINT,
            }).signers([userFrom]).instruction();
            const tx = new Transaction().add(verifyInstruction, sendInstruction);
            tx.feePayer = userFrom.publicKey;
            await sendAndConfirmTransaction(connection, tx, [userFrom], { commitment: 'confirmed' });
          })()
        ).to.be.rejectedWith("Invalid input arguments");

      });
    });


    it("receive", async () => {

      const userTo = user;
      const token = tokenMint1.publicKey;
      const amountToReceive = 50;
      const receiveNonce = 0;

      const value: ReceivePayload = {
        to: userTo.publicKey.toBytes(),
        tokenAddressTo: token.toBytes(),
        amountTo: amountToReceive,
        chainTo: SOLANA_CHAIN_ID,
        chainFrom: AMB_CHAIN_ID,
        eventId: 1,
        flags: new Uint8Array(32),
        flagData: numberToUint8Array(receiveNonce, 8)
      };

      const receiveInstruction = await bridgeProgram.methods.receive(
        new BN(value.amountTo),
        new BN(value.eventId),
        [...value.flags],
        Buffer.from(value.flagData)
      ).accountsPartial({
        receiver: userTo.publicKey,
        mint: token,
      }).signers([userTo]).instruction()


      // receive without signature
      await expect(
        (async () => {
          const tx = new Transaction().add(receiveInstruction);
          tx.feePayer = userTo.publicKey;
          await sendAndConfirmTransaction(connection, tx, [userTo], { commitment: 'confirmed' }); // wait for transaction to be confirmed
        })()
      ).to.be.rejectedWith("The arguments provided to a program instruction were invalid");

      // send with wrong instruction
      await expect(
        (async () => {
          const tx = new Transaction().add(unwrapWSolInstruction(userTo.publicKey), receiveInstruction);
          tx.feePayer = userTo.publicKey;
          await sendAndConfirmTransaction(connection, tx, [userTo], { commitment: 'confirmed' }); // wait for transaction to be confirmed
        })()
      ).to.be.rejectedWith("Signature invalid");

      // send with wrong signature
      await expect(
        (async () => {
          const signature = signMessage(serializeReceivePayload({ ...value, chainTo: 123 }), receiveSigners);
          const verifyInstruction = verifySignatureInstruction(signature);
          const tx = new Transaction().add(verifyInstruction, receiveInstruction);
          tx.feePayer = userTo.publicKey;
          await sendAndConfirmTransaction(connection, tx, [userTo], { commitment: 'confirmed' }); // wait for transaction to be confirmed
        })()
      ).to.be.rejectedWith("Signature invalid");


      // send with wrong mint account
      await expect(
        (async () => {
          const signature = signMessage(serializeReceivePayload(value), [sendSigner]);
          const verifyInstruction = verifySignatureInstruction(signature);
          const receiveInstruction = await bridgeProgram.methods.receive(
            new BN(value.amountTo),
            new BN(value.eventId),
            [...value.flags],
            Buffer.from(value.flagData)
          ).accountsPartial({
            receiver: userTo.publicKey,
            mint: NATIVE_MINT,
          }).signers([userTo]).instruction()
          const tx = new Transaction().add(verifyInstruction, receiveInstruction);
          tx.feePayer = userTo.publicKey;
          await sendAndConfirmTransaction(connection, tx, [userTo], { commitment: 'confirmed' }); // wait for transaction to be confirmed
        })()
      ).to.be.rejectedWith("Signature invalid");

    });
  });


  // helpers

  async function commonSend(
    userFrom: Keypair, tokenFrom: PublicKey, userTo: Uint8Array, tokenTo: Uint8Array,
    amountToSend: number,
    isMintable = false, additionalInstructions = [], feeAmount = 20
  ) {


    const value: SendPayload = {
      tokenAddressFrom: tokenFrom.toBytes(),
      tokenAddressTo: tokenTo,
      amountToSend,
      feeAmount: feeAmount,
      chainFrom: SOLANA_CHAIN_ID,
      chainTo: AMB_CHAIN_ID,
      timestamp: Date.now(),
      flags: new Uint8Array(32),
      flagData: new Uint8Array(0),
    };


    const payload = serializeSendPayload(value);
    const signature = signMessage(payload, [sendSigner]);

    const verifyInstruction = verifySignatureInstruction(signature);
    // send tokens
    const sendInstruction = await bridgeProgram.methods.send(payload, [...userTo]).accountsPartial({
      sender: userFrom.publicKey,
      mint: tokenFrom,
      bridgeTokenAccount: isMintable ? null : undefined,  // pass null to not use bridge token account
    }).signers([userFrom]).instruction();

    const tx = new Transaction().add(...additionalInstructions, verifyInstruction, sendInstruction);
    tx.feePayer = userFrom.publicKey;
    const txSignature = await sendAndConfirmTransaction(connection, tx, [userFrom], { commitment: 'confirmed' }); // wait for transaction to be confirmed
    const txParsed = await connection.getParsedTransaction(txSignature, { commitment: 'confirmed' });

    return txParsed;
  }


  async function commonReceive(
    userTo: Keypair, token: PublicKey, amountToReceive: number,
    receiveNonce: number, isMintable = false, shouldUnwrap = false
  ) {

    const value: ReceivePayload = {
      to: userTo.publicKey.toBytes(),
      tokenAddressTo: token.toBytes(),
      amountTo: amountToReceive,
      chainTo: SOLANA_CHAIN_ID,
      chainFrom: AMB_CHAIN_ID,
      eventId: 1,
      flags: new Uint8Array(32),
      flagData: numberToUint8Array(receiveNonce, 8)
    };

    const payload = serializeReceivePayload(value);
    const signature = signMessage(payload, receiveSigners);

    const verifyInstruction = verifySignatureInstruction(signature);
    const unwrapInstructions = shouldUnwrap ? [unwrapWSolInstruction(userTo.publicKey)] : [];

    const receiveInstruction = await bridgeProgram.methods.receive(
      new BN(value.amountTo),
      new BN(value.eventId),
      [...value.flags],
      Buffer.from(value.flagData)
    ).accountsPartial({
      receiver: userTo.publicKey,
      mint: token,
      bridgeTokenAccount: isMintable ? null : undefined,  // pass null to not use bridge token account
    }).signers([userTo]).instruction()

    const tx = new Transaction().add(verifyInstruction, receiveInstruction, ...unwrapInstructions);
    tx.feePayer = userTo.publicKey;
    const txSignature = await sendAndConfirmTransaction(connection, tx, [userTo], { commitment: 'confirmed' }); // wait for transaction to be confirmed
    const txParsed = await connection.getParsedTransaction(txSignature, { commitment: 'confirmed' });

    return txParsed;
  }


  async function getStateSnapshot(token: PublicKey, userPubkey: PublicKey) {
    const [_, bridgeATA] = getBridgeTokenAccounts(token, program.programId);
    const bridgeStatePDA = getBridgeStateAccount(program.programId);

    const getTokenBalance_ = (pubkey: PublicKey) =>
      okOrUndefined(async () =>
        +(await connection.getTokenAccountBalance(pubkey)).value.amount
      );

    const tokenBalanceUser = await getTokenBalance_(getAssociatedTokenAddressSync(token, userPubkey));
    const tokenBalanceBridge = await getTokenBalance_(bridgeATA);

    const nativeBalanceUser = await connection.getBalance(userPubkey);
    const nativeBalanceBridge = await connection.getBalance(bridgeStatePDA);


    const sendNonce = +(await program.account.globalState.fetch(bridgeStatePDA)).nonce;
    const receiverNonce = await okOrUndefined(async () =>
      +(await program.account.nonceAccount.fetch(getUserNoncePda(userPubkey, bridgeProgram.programId))).nonceCounter
    );


    return {
      native: { user: nativeBalanceUser, bridge: nativeBalanceBridge },
      token: { user: tokenBalanceUser, bridge: tokenBalanceBridge },
      sendNonce,
      receiverNonce,
    }

  }

  async function getEvents(txSignature: TransactionSignature) {
    const txParsed = await connection.getParsedTransaction(txSignature, { commitment: 'confirmed' });
    const eventParser = new EventParser(program.programId, new BorshCoder(program.idl));
    const events = eventParser.parseLogs(txParsed.meta.logMessages);
    return [...events];
  }


  async function mintTokens(mint: PublicKey, to: PublicKey, amount: number) {
    await mintTo(connection, admin, mint, to, admin, amount, [], { commitment: 'confirmed' });
  }

})


async function requestSol(account, connection, amount = 5000 * 10 ** 9) {
  const signature = await connection.requestAirdrop(account.publicKey, amount);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature }, 'confirmed');
}

async function okOrUndefined(promise: () => Promise<any>) {
  try {
    return await promise();
  } catch (e) {
    return undefined
  }
}
