import { Address, Hex, PublicClient } from "viem";
import { bridgeAbi } from "../abi/bridgeAbi";
import { FullReceipt, MiniReceipt } from "../types/calls";
import { hashReceipt } from "./helpers";

/**
 * Checks if a receipt has been claimed.
 * If input is a Full/Mini receipt, it will hash it first.
 * @param {FullReceipt | MiniReceipt | Hex} receiptOrHash The Full/Mini receipt or its hash to check
 * @param {Address} bridgeAddress The address of the bridge contract
 * @param {PublicClient} publicClient The public client instance to use for the query
 * @returns {Promise<boolean>} true if the receipt has been claimed, false otherwise
 * @throws Error if the receipt is invalid or the request fails
 */
export async function checkIsClaimed(
  receiptOrHash: FullReceipt | MiniReceipt | Hex,
  bridgeAddress: Address,
  publicClient: PublicClient,
): Promise<boolean> {
  const hash =
    typeof receiptOrHash === "string"
      ? receiptOrHash
      : hashReceipt(receiptOrHash);
  return publicClient.readContract({
    address: bridgeAddress,
    abi: bridgeAbi,
    functionName: "isClaimed",
    args: [hash],
  }) as Promise<boolean>;
}

/**
 * Get the amount of native coin to send in addition to the token amount when claiming a receipt
 * It is applicable only when special flag passed in the send function.
 * @param {Address} bridgeAddress The address of the bridge contract
 * @param {PublicClient} publicClient The public client instance to use for the query
 * @returns {Promise<bigint>} The amount of native coin to send in addition to the token amount
 * @throws Error if the request fails
 */
export async function amountAdditionalNativeToSend(
  bridgeAddress: Address,
  publicClient: PublicClient,
): Promise<bigint> {
  return publicClient.readContract({
    address: bridgeAddress,
    abi: bridgeAbi,
    functionName: "nativeSendAmount",
    args: [],
  }) as Promise<bigint>;
}
