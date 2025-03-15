import { Hex } from "viem";
import { backendUrl } from "../config";
import { helpers } from "../evm";

export async function getSendPayload(
  networkFrom: bigint,
  networkTo: bigint,
  tokenAddress: Hex,
  amountToSend: bigint,
  externalTokenAddress: Hex,
  flags: bigint = 0n,
  flagData: Hex = "0x"
) {
  const sendPayloadUrl: URL = URL.parse("/api/send-payload", backendUrl)!;
  sendPayloadUrl.searchParams.set("networkFrom", networkFrom.toString());
  sendPayloadUrl.searchParams.set("networkTo", networkTo.toString());
  if (tokenAddress.length !== 66 && tokenAddress.startsWith("0x")) {
    tokenAddress = helpers.addressToBytes32(tokenAddress);
  }
  sendPayloadUrl.searchParams.set("tokenAddress", tokenAddress);
  sendPayloadUrl.searchParams.set("amountToSend", amountToSend.toString());
  sendPayloadUrl.searchParams.set("externalTokenAddress", externalTokenAddress);
  sendPayloadUrl.searchParams.set("flags", flags.toString());
  sendPayloadUrl.searchParams.set("flagData", flagData);
  const response = await fetch(sendPayloadUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to get send payload: ${
        response.statusText
      }, ${await response.json()}`
    );
  }
  const data = await response.json();
  if (!data.sendPayload || !data.signature) {
    throw new Error("Invalid response from backend");
  }
  return {
    sendPayload: {
      destChainId: BigInt(data.sendPayload.destChainId),
      tokenAddress: data.sendPayload.tokenAddress,
      externalTokenAddress: data.sendPayload.externalTokenAddress,
      amountToSend: BigInt(data.sendPayload.amountToSend),
      feeAmount: BigInt(data.sendPayload.feeAmount),
      timestamp: BigInt(data.sendPayload.timestamp),
      flags: BigInt(data.sendPayload.flags),
      flagData,
    },
    signature: data.signature,
  };
}
