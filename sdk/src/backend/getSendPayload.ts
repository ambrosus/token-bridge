import { Hex } from "viem";
import { backendUrl } from "../config";
import { helpers } from "../evm";

/**
 * Fetches the signed send payload required for a cross-chain token transfer.
 *
 * @param {bigint} networkFrom - Chain ID of the sender as a bigint.
 * @param {bigint} networkTo - Chain ID of the receiver as a bigint.
 * @param {Hex} tokenAddress - Address of the token in bytes32 hex format.
 * @param {bigint} amountToSend - Amount of tokens to send as a bigint.
 * @param {Hex} externalTokenAddress - Address of the external token in bytes32 hex format.
 * @param {bigint} [flags=0] - Optional flags for the transaction as a bigint. Defaults to 0n.
 * @param {Hex} [flagData='0x'] - Optional extra data for flags in hex format. Defaults to "0x".
 *
 * @returns {Promise<{ sendPayload: SendPayload; signature: Hex }>} An object containing the send payload and its signature.
 *
 * @throws Will throw an error if the fetch request fails or the response is invalid.
 */

export async function getSendPayload(
  networkFrom: bigint,
  networkTo: bigint,
  tokenAddress: Hex,
  amountToSend: bigint,
  externalTokenAddress: Hex,
  flags: bigint = 0n,
  flagData: Hex = "0x",
): Promise<{ sendPayload: SendPayload; signature: Hex }> {
  const sendPayloadUrl: URL = URL.parse("/api/send-payload", backendUrl)!;
  sendPayloadUrl.searchParams.set("networkFrom", networkFrom.toString());
  sendPayloadUrl.searchParams.set("networkTo", networkTo.toString());
  if (tokenAddress.length !== 66 && tokenAddress.startsWith("0x")) {
    tokenAddress = helpers.addressToBytes32(tokenAddress);
  }
  sendPayloadUrl.searchParams.set("tokenAddress", tokenAddress);
  sendPayloadUrl.searchParams.set("amountToSend", amountToSend.toString());
  if (
    externalTokenAddress.length !== 66 &&
    externalTokenAddress.startsWith("0x")
  ) {
    externalTokenAddress = helpers.addressToBytes32(externalTokenAddress);
  }
  sendPayloadUrl.searchParams.set("externalTokenAddress", externalTokenAddress);
  sendPayloadUrl.searchParams.set("flags", flags.toString());
  sendPayloadUrl.searchParams.set("flagData", flagData);
  const response = await fetch(sendPayloadUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to get send payload: ${response.status}, ${JSON.stringify(
        await response.json(),
      )}`,
    );
  }
  const data = await response.json();
  if (!data.sendPayload || !data.signature) {
    throw new Error("Invalid response from backend");
  }
  return {
    sendPayload: {
      chainFrom: BigInt(data.sendPayload.chainFrom),
      chainTo: BigInt(data.sendPayload.chainTo),
      tokenAddressFrom: data.sendPayload.tokenAddressFrom,
      tokenAddressTo: data.sendPayload.tokenAddressTo,
      amountToSend: BigInt(data.sendPayload.amountToSend),
      feeAmount: BigInt(data.sendPayload.feeAmount),
      timestamp: BigInt(data.sendPayload.timestamp),
      flags: BigInt(data.sendPayload.flags),
      flagData,
    },
    signature: data.signature,
  };
}

export interface SendPayload {
  chainFrom: bigint;
  chainTo: bigint;
  tokenAddressFrom: Hex;
  tokenAddressTo: Hex;
  amountToSend: bigint;
  feeAmount: bigint;
  timestamp: bigint;
  flags: bigint;
  flagData: Hex;
}
