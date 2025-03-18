import { getBridgeTokenInfo, hexToUint8Array } from "./utils";
import { Connection, PublicKey, sendAndConfirmTransaction, type Signer, Transaction } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { verifySignatureInstruction } from "./ed25519_ix";
import type { AmbSolBridge } from "../idl/idlType";
import { wrapSolInstructions } from "./wsol_ix";
import { NATIVE_MINT } from "@solana/spl-token";
import { SendPayload } from "../../backend";
import { convertSendPayload, serializeSendPayload } from "./types";
import { keccak_256 } from "@noble/hashes/sha3";

export async function send(
  connection: Connection,
  bridgeProgram: Program<AmbSolBridge>,
  userFrom: Signer,
  userTo: string,
  sendPayload: SendPayload,
  signature: string,
) {
  const payload = convertSendPayload(sendPayload);
  const serializedPayload = serializeSendPayload(payload);

  const signer = hexToUint8Array("0x028dfd50cd64a4e6b0a2c28032f05196de880d3985164b2542270a006bdf2038ea");  // todo
  const signatureMessage = keccak_256(serializedPayload)
  const verifyInstruction = verifySignatureInstruction(signatureMessage, [signer], [hexToUint8Array(signature)]);

  const tokenFrom = new PublicKey(payload.tokenAddressTo)
  const { isMintable } = await getBridgeTokenInfo(bridgeProgram, tokenFrom);

  const wrapInstructions = (tokenFrom == NATIVE_MINT) ?
    await wrapSolInstructions(connection, userFrom, Number(payload.amountToSend)) : [];

  const sendInstruction = await bridgeProgram.methods
    .send(serializedPayload, [...hexToUint8Array(userTo)])
    .accountsPartial({
      sender: userFrom.publicKey,
      mint: tokenFrom,
      bridgeTokenAccount: isMintable ? null : undefined,  // pass null to not use bridge token account
    }).signers([userFrom]).instruction();


  const tx = new Transaction().add(...wrapInstructions, verifyInstruction, sendInstruction);
  tx.feePayer = userFrom.publicKey;
  return await sendAndConfirmTransaction(connection, tx, [userFrom], { commitment: 'confirmed' }); // wait for transaction to be confirmed
}


