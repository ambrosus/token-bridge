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

/**
 * Parse a receipt with meta returned from the backend into a ReceiptWithMeta.
 *
 * @param receiptWithMeta - the receipt with meta returned from the backend
 * @returns {ReceiptWithMeta} Parsed receipt with meta
 */
export function parseReceiptWithMeta(receiptWithMeta: {
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

/**
 * Fetches the receiptId for a specific transaction hash from the backend.
 *
 * @param {string} txHash - The transaction hash to retrieve the receiptId for.
 * @returns {Promise<string>} A promise that resolves to the receiptId for the given transaction hash.
 * @throws Will throw an error if the network request fails or the receipt is not found.
 */
export async function getReceiptIdByTxHash(txHash: string): Promise<string> {
  const receiptIdByTxHashUrl: URL = URL.parse(
    `/api/receipts/transaction/${txHash}`,
    backendUrl,
  )!;
  const response = await fetch(receiptIdByTxHashUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to get receipt by tx hash: ${response.status}, ${JSON.stringify(
        await response.json(),
      )}`,
    );
  }
  const data = await response.json();
  return data.receiptId;
}

/**
 * Get all receipts from the backend.
 *
 * @param {number} [limit=50] - the number of receipts to return
 * @param {number} [offset=0] - the number of receipts to skip
 * @param {"asc"|"desc"} [ordering="desc"] - the ordering of the receipts
 * @returns {Promise<Array<ReceiptWithMeta>>} Promise that resolves to the receipts array
 */
export async function getAllReceipts(
  limit: number = 50,
  offset: number = 0,
  ordering: "asc" | "desc" = "desc",
): Promise<Array<ReceiptWithMeta>> {
  const receiptsUrl: URL = URL.parse("/api/receipts", backendUrl)!;
  receiptsUrl.searchParams.set("limit", limit.toString());
  receiptsUrl.searchParams.set("offset", offset.toString());
  receiptsUrl.searchParams.set("ordering", ordering);
  const response = await fetch(receiptsUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to get receipts: ${response.status}, ${JSON.stringify(
        await response.json(),
      )}`,
    );
  }
  const data = await response.json();
  return data.map(parseReceiptWithMeta);
}

/**
 * Retrieve all receipts associated with a specific address from the backend.
 *
 * @param {string} address - The address to filter receipts by.
 * @param {number} [limit=50] - The maximum number of receipts to return.
 * @param {number} [offset=0] - The number of receipts to skip before starting to collect the result set.
 * @param {"asc"|"desc"} [ordering="desc"] - The order in which to sort the receipts, either ascending or descending.
 * @returns {Promise<Array<ReceiptWithMeta>>} A promise that resolves to an array of receipts with metadata.
 * @throws Will throw an error if the network request fails.
 */

export async function getReceiptsByAddress(
  address: string,
  limit: number = 50,
  offset: number = 0,
  ordering: "asc" | "desc" = "desc",
): Promise<Array<ReceiptWithMeta>> {
  const receiptsByAddressUrl: URL = URL.parse(
    `/api/receipts/user/${address}`,
    backendUrl,
  )!;
  receiptsByAddressUrl.searchParams.set("limit", limit.toString());
  receiptsByAddressUrl.searchParams.set("offset", offset.toString());
  receiptsByAddressUrl.searchParams.set("ordering", ordering);
  const response = await fetch(receiptsByAddressUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to get receipts by address: ${response.status}, ${JSON.stringify(
        await response.json(),
      )}`,
    );
  }
  const data = await response.json();
  return data.map(parseReceiptWithMeta);
}

/**
 * Fetches a specific receipt by its ID from the backend.
 *
 * @param {string} receiptId - The ID of the receipt to retrieve.
 * @returns {Promise<ReceiptWithMeta>} A promise that resolves to the receipt with metadata.
 * @throws Will throw an error if the network request fails or the receipt is not found.
 */

export async function getReceipt(receiptId: string): Promise<ReceiptWithMeta> {
  const receiptByIdUrl: URL = URL.parse(
    `/api/receipts/${receiptId}`,
    backendUrl,
  )!;
  const response = await fetch(receiptByIdUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to get receipt: ${response.status}, ${JSON.stringify(
        await response.json(),
      )}`,
    );
  }
  const data = await response.json();
  return parseReceiptWithMeta(data);
}

/**
 * Fetches the signatures for a specific receipt by its ID from the backend.
 *
 * @param {string} receiptId - The ID of the receipt to retrieve the signatures for.
 * @returns {Promise<ReceiptSignatures>} A promise that resolves to the signatures for the receipt with the given ID.
 * @throws Will throw an error if the network request fails or the receipt is not found.
 */
export async function getReceiptSignature(
  receiptId: string,
): Promise<ReceiptSignatures> {
  const receiptByIdUrl: URL = URL.parse(
    `/api/receipts/signatures/${receiptId}`,
    backendUrl,
  )!;
  const response = await fetch(receiptByIdUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to get receipt: ${response.status}, ${JSON.stringify(
        await response.json(),
      )}`,
    );
  }
  const data = await response.json();
  return data as ReceiptSignatures;
}
