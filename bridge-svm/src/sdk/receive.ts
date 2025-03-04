import { Connection, PublicKey, sendAndConfirmTransaction, type Signer, Transaction } from "@solana/web3.js";
import { getBridgeAccounts, getOrCreateUserATA } from "./utils";
import { Program } from "@coral-xyz/anchor";
import { newEd25519Instruction } from "./ed25519_ix";
import { getReceivePayload } from "../backend/signs";
import type { AmbSolBridge } from "../idl/idlType";

export async function receive(
  connection: Connection,
  user: Signer,
  bridgeProgram: Program<AmbSolBridge>,
) {
  const {value, payload, message, signers, signatures} = await getReceivePayload(user.publicKey);
  const token = new PublicKey(value.tokenAddressTo)

  const user_token_ata = (await getOrCreateUserATA(connection, user, token)).address;
  // const nonceAccount = getUserNoncePda(user.publicKey, bridgeProgram.programId);

  const verifyInstruction = newEd25519Instruction(message, signers, signatures);

  const receiveInstruction = await bridgeProgram.methods.receive(payload).accounts({
    receiver: user.publicKey,
    // receiverTokenAccount: user_token_ata,
    // receiverNonceAccount: nonceAccount,
    ...getBridgeAccounts(token, bridgeProgram.programId),
  }).signers([user]).instruction()

  const tx = new Transaction().add(verifyInstruction, receiveInstruction);
  tx.feePayer = user.publicKey;
   // wait for transaction to be confirmed
  return await sendAndConfirmTransaction(connection, tx, [user], { commitment: 'confirmed' });

}


