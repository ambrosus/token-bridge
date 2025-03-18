import {
  Address,
  PublicClient,
  WalletClient,
  WriteContractReturnType,
} from "viem";
import { getBridgeContract } from "./contract";
import { type ClaimCall } from "../types/calls";
import { handleCustomError } from "../utils/customErrors";

/**
 * Claim tokens on the EVM sidechain.
 *
 * This function will first simulate the call to check for any potential errors.
 * If the simulation is successful, it will then execute the call on the blockchain.
 *
 * @param {ClaimCall} claimParams - The parameters for the claim call.
 * @param {Address} bridgeAddress - The address of the bridge contract.
 * @param {PublicClient} publicClient - The public client to use for the simulation.
 * @param {WalletClient} walletClient - The wallet client to use for the call.
 * @returns {Promise<WriteContractReturnType>} The transaction hash of the executed call.
 * @throws Error if the call fails.
 */
export async function claimInEVM(
  claimParams: ClaimCall,
  bridgeAddress: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
): Promise<WriteContractReturnType> {
  const bridgeContract = getBridgeContract(
    bridgeAddress,
    publicClient,
    walletClient,
  );
  try {
    const params = [claimParams.receipt, claimParams.signature];
    await bridgeContract.simulate.claim(params);
    return await bridgeContract.write.claim(params);
  } catch (err) {
    throw handleCustomError(err as Error);
  }
}
