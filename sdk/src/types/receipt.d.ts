import { type Hex } from "viem";

export interface ReceiptWithMeta {
  receipt: {
    receiptId: string;
    timestamp: bigint;
    bridgeAddress: string;
    from: Hex;
    to: Hex;
    tokenAddressFrom: Hex;
    tokenAddressTo: Hex;
    amountFrom: bigint;
    amountTo: bigint;
    chainFrom: bigint;
    chainTo: bigint;
    eventId: bigint;
    flags: bigint;
    data: Hex;
    claimed: boolean;
    signaturesCount: number;
    signaturesRequired: number;
  };
  receiptMeta: Array<{
    receiptId: string;
    eventChain: bigint;
    blockHash: Hex | null;
    blockNumber: bigint;
    timestamp: bigint;
    transactionHash: string;
    transactionIndex: number;
  }>;
}

export interface ReceiptSignatures {
  receiptId: string;
  readyForClaim: boolean;
  signatures: Array<{
    receiptId: string;
    signedBy: string;
    messageHash: Hex;
    signature: Hex;
  }>;
}
