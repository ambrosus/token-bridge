import { Buffer } from "buffer";
import * as borsh from "borsh";
import { ReceiptSignatures, ReceiptWithMeta, SendPayload } from "../../backend";
import { bignumberToUint8Array, hexToUint8Array, SOLANA_CHAIN_ID } from "./utils";
import { Base58 } from "ox";


const _b20 = { array: { type: 'u8', len: 20 } };
const _b32 = { array: { type: 'u8', len: 32 } };
const serialize = (value: any, schema: any) => Buffer.from(borsh.serialize({ struct: schema }, value));


export interface SendPayloadSolana {
  tokenAddressFrom: Uint8Array;
  tokenAddressTo: Uint8Array;
  amountToSend: number | bigint;
  feeAmount: number | bigint;
  chainFrom: number | bigint;
  chainTo: number | bigint;
  timestamp: number;
  flags: Uint8Array;
  flagData: Uint8Array;
}

const sendSchema = {
  tokenAddressFrom: _b32,
  tokenAddressTo: _b20,
  amountToSend: 'u64',
  feeAmount: 'u64',
  chainFrom: 'u64',
  chainTo: 'u64',
  timestamp: 'u64',
  flags: _b32,
  flagData: { array: { type: 'u8' } },
}

export interface ReceivePayloadSolana {
  to: Uint8Array;
  tokenAddressTo: Uint8Array;
  amountTo: number | bigint;
  chainFrom: number | bigint;
  chainTo: number | bigint;
  eventId: number | bigint;
  flags: Uint8Array;
  flagData: Uint8Array;
}

const receiveSchema = {
  to: _b32,
  tokenAddressTo: _b32,
  amountTo: 'u64',
  chainFrom: 'u64',
  chainTo: 'u64',
  eventId: 'u64',
  flags: _b32,
  flagData: { array: { type: 'u8' } },
}


export const serializeSendPayload = (value: SendPayloadSolana) => serialize(value, sendSchema);
export const serializeReceivePayload = (value: ReceivePayloadSolana) => serialize(value, receiveSchema)




export function convertSendPayload(sendPayload: SendPayload): SendPayloadSolana {
  return {
    tokenAddressFrom: hexToUint8Array(sendPayload.tokenAddressFrom),
    tokenAddressTo: hexToUint8Array(sendPayload.tokenAddressTo),
    amountToSend: sendPayload.amountToSend,
    feeAmount: sendPayload.feeAmount,
    // chainFrom: sendPayload.chainFrom,  // todo
    chainFrom: SOLANA_CHAIN_ID,
    chainTo: sendPayload.chainTo,
    timestamp: Number(sendPayload.timestamp),
    flags: bignumberToUint8Array(sendPayload.flags, 32),
    flagData: hexToUint8Array(sendPayload.flagData),
  }
}


export function convertReceivePayload(receipt: ReceiptWithMeta): ReceivePayloadSolana {
  const receivePayload = receipt.receipt;
  return {
    to: hexToUint8Array(receivePayload.to),
    tokenAddressTo: hexToUint8Array(receivePayload.tokenAddressTo),
    amountTo: receivePayload.amountTo,
    chainFrom: receivePayload.chainFrom,
    chainTo: receivePayload.chainTo,
    eventId: Number(receivePayload.eventId),
    flags: bignumberToUint8Array(receivePayload.flags, 32),
    flagData: hexToUint8Array(receivePayload.data),
  }
}


export function convertSignatures(receiptSignatures: ReceiptSignatures) {
  const signatures = receiptSignatures.signatures.map((sig) => Base58.toBytes(sig.signature));
  const signers = receiptSignatures.signatures.map((sig) => hexToUint8Array(sig.signedBy));
  return { signatures, signers };
}


