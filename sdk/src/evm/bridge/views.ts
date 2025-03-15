import { Address, Hex, PublicClient } from "viem";
import { bridgeAbi } from "../abi/bridgeAbi";
import { FullReceipt, MiniReceipt } from "../types/calls";

export async function checkIsClaimed(
  receiptOrHash: FullReceipt | MiniReceipt | Hex,
  bridgeAddress: Address,
  publicClient: PublicClient
): Promise<boolean> {
  return (await publicClient.readContract({
    address: bridgeAddress,
    abi: bridgeAbi,
    functionName: "isClaimed",
    args: [receiptOrHash],
  })) as boolean;
}

export async function amountAdditionalNativeToSend(
  bridgeAddress: Address,
  publicClient: PublicClient
): Promise<bigint> {
  return (await publicClient.readContract({
    address: bridgeAddress,
    abi: bridgeAbi,
    functionName: "nativeSendAmount",
    args: [],
  })) as bigint;
}
