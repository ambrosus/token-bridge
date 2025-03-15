import { Hex } from "viem";
import { backendUrl } from "../config";

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
  };
  receiptMeta: Array<{
    receiptId: string;
    blockHash: Hex | null;
    blockNumber: bigint;
    timestamp: bigint;
    transactionHash: string;
    transactionIndex: number;
  }>;
}

export interface ReceiptSignatures {
  receiptId: string;
  signatures: Array<{
    receiptId: string;
    signedBy: string;
    signature: Hex;
  }>;
}

function parseReceiptWithMeta(receiptWithMeta: {
  receipt: any;
  receiptMeta: any[];
}): ReceiptWithMeta {
  return {
    receipt: {
      receiptId: receiptWithMeta.receipt.receiptId,
      timestamp: BigInt(receiptWithMeta.receipt.timestamp),
      bridgeAddress: receiptWithMeta.receipt.bridgeAddress,
      from: receiptWithMeta.receipt.from,
      to: receiptWithMeta.receipt.to,
      tokenAddressFrom: receiptWithMeta.receipt.tokenAddressFrom,
      tokenAddressTo: receiptWithMeta.receipt.tokenAddressTo,
      amountFrom: BigInt(receiptWithMeta.receipt.amountFrom),
      amountTo: BigInt(receiptWithMeta.receipt.amountTo),
      chainFrom: BigInt(receiptWithMeta.receipt.chainFrom),
      chainTo: BigInt(receiptWithMeta.receipt.chainTo),
      eventId: BigInt(receiptWithMeta.receipt.eventId),
      flags: BigInt(receiptWithMeta.receipt.flags),
      data: receiptWithMeta.receipt.data,
      claimed: receiptWithMeta.receipt.claimed,
    },
    receiptMeta: receiptWithMeta.receiptMeta.map((meta: any) => ({
      receiptId: meta.receiptId,
      blockHash: meta.blockHash,
      blockNumber: BigInt(meta.blockNumber),
      timestamp: BigInt(meta.timestamp),
      transactionHash: meta.transactionHash,
      transactionIndex: meta.transactionIndex,
    })),
  };
}

export async function getAllReceipts(
  limit: number = 50,
  offset: number = 0,
  ordering: "asc" | "desc" = "desc"
): Promise<Array<ReceiptWithMeta>> {
  const receiptsUrl: URL = URL.parse("/api/receipts", backendUrl)!;
  receiptsUrl.searchParams.set("limit", limit.toString());
  receiptsUrl.searchParams.set("offset", offset.toString());
  receiptsUrl.searchParams.set("ordering", ordering);
  const response = await fetch(receiptsUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to get receipts: ${response.statusText}, ${await response.json()}`
    );
  }
  const data = await response.json();
  return data.map(parseReceiptWithMeta);
}

export async function getReceiptsByAddress(
  address: string,
  limit: number = 50,
  offset: number = 0,
  ordering: "asc" | "desc" = "desc"
): Promise<Array<ReceiptWithMeta>> {
  const receiptsByAddressUrl: URL = URL.parse(
    `/api/receipts/user/${address}`,
    backendUrl
  )!;
  receiptsByAddressUrl.searchParams.set("limit", limit.toString());
  receiptsByAddressUrl.searchParams.set("offset", offset.toString());
  receiptsByAddressUrl.searchParams.set("ordering", ordering);
  const response = await fetch(receiptsByAddressUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to get receipts by address: ${
        response.statusText
      }, ${await response.json()}`
    );
  }
  const data = await response.json();
  return data.map(parseReceiptWithMeta);
}

export async function getReceipt(receiptId: string): Promise<ReceiptWithMeta> {
  const receiptByIdUrl: URL = URL.parse(
    `/api/receipts/${receiptId}`,
    backendUrl
  )!;
  const response = await fetch(receiptByIdUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to get receipt: ${response.statusText}, ${await response.json()}`
    );
  }
  const data = await response.json();
  return parseReceiptWithMeta(data);
}

export async function getReceiptSignature(
  receiptId: string
): Promise<ReceiptSignatures> {
  const receiptByIdUrl: URL = URL.parse(
    `/api/receipts/signatures/${receiptId}`,
    backendUrl
  )!;
  const response = await fetch(receiptByIdUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to get receipt: ${response.statusText}, ${await response.json()}`
    );
  }
  const data = await response.json();
  return data as ReceiptSignatures;
}
