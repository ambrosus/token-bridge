import { Hex } from "viem";

export interface SendPayloadEVM {
  destChainId: bigint;
  tokenAddress: Hex;
  externalTokenAddress: Hex;
  amountToSend: bigint;
  feeAmount: bigint;
  timestamp: number | bigint;
  flags: bigint;
  flagData: Hex;
}

export interface SendCall {
  recipient: Hex;
  payload: SendPayloadEVM;
  payloadSignature: Hex;
  // Permit optional fields
  _deadline?: bigint;
  v?: bigint;
  r?: Hex;
  s?: Hex;
}

export interface MiniReceipt {
  to: Hex;
  tokenAddressTo: Hex;
  amountTo: bigint;
  chainFrom: bigint;
  chainTo: bigint;
  eventId: bigint;
  flags: bigint;
  data: Hex;
}

export interface FullReceipt extends MiniReceipt {
  from: Hex;
  tokenAddressFrom: Hex;
  amountFrom: bigint;
}

export interface ClaimCall {
  receipt: FullReceipt | MiniReceipt;
  signature: Hex;
}
