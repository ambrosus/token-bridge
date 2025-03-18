import { Buffer } from "buffer";
import { BN, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, sendAndConfirmTransaction, type Signer, Transaction } from "@solana/web3.js";
import type { AmbSolBridge } from "../idl/idlType";
import { verifySignatureInstruction } from "./ed25519_ix";
import { unwrapWSolInstruction } from "./wsol_ix";
import { checkFlags, Flags, getBridgeTokenInfo } from "./utils";
import { NATIVE_MINT } from "@solana/spl-token";
import { convertReceivePayload, convertSignatures, serializeReceivePayload } from "./types";
import { ReceiptSignatures, ReceiptWithMeta } from "../../backend";
import { keccak_256 } from "@noble/hashes/sha3";


export async function receive(
  connection: Connection,
  user: Signer,
  bridgeProgram: Program<AmbSolBridge>,
  receipt: ReceiptWithMeta,
  signatures: ReceiptSignatures,
) {

  const payload = convertReceivePayload(receipt)
  const serializedPayload = serializeReceivePayload(payload);

  const signature = convertSignatures(signatures);
  const signatureMessage = keccak_256(serializedPayload)
  const verifyInstruction = verifySignatureInstruction(signatureMessage, signature.signers, signature.signatures);

  const token = new PublicKey(payload.tokenAddressTo);

  const { isMintable } = await getBridgeTokenInfo(bridgeProgram, new PublicKey(payload.tokenAddressTo));

  const shouldUnwrap = token == NATIVE_MINT && checkFlags(payload.flags, Flags.SHOULD_UNWRAP);
  const unwrapInstructions = shouldUnwrap ? [unwrapWSolInstruction(user.publicKey)] : [];

  const receiveInstruction = await bridgeProgram.methods
    .receive(
      new BN(payload.amountTo),
      new BN(payload.eventId),
      [...payload.flags],
      Buffer.from(payload.flagData)
    ).accountsPartial({
      receiver: user.publicKey,
      mint: token,
      bridgeTokenAccount: isMintable ? null : undefined,  // pass null to not use bridge token account
    }).signers([user]).instruction()

  const tx = new Transaction().add(...unwrapInstructions, verifyInstruction, receiveInstruction);
  tx.feePayer = user.publicKey;
  // wait for transaction to be confirmed
  return await sendAndConfirmTransaction(connection, tx, [user], { commitment: 'confirmed' });

}

