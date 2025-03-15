import { Address, PublicClient, WalletClient } from "viem";
import { getBridgeContract } from "./contract";
import { type ClaimCall } from "../types/calls";
import { handleCustomError } from "../utils/customErrors";

export async function claimInEVM(
  claimParams: ClaimCall,
  bridgeAddress: Address,
  publicClient: PublicClient,
  walletClient: WalletClient
) {
  const bridgeContract = getBridgeContract(
    bridgeAddress,
    publicClient,
    walletClient
  );
  try {
    const params = [claimParams.receipt, claimParams.signature];
    await bridgeContract.simulate.claim(params);
    return await bridgeContract.write.claim(params);
  } catch (err) {
    throw handleCustomError(err as Error);
  }
}
