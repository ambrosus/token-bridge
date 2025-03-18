import { PublicClient, WalletClient, getContract, Address } from "viem";
import { bridgeAbi } from "../abi/bridgeAbi";

/**
 * Create a contract instance for the bridge contract
 * @param {Address} bridgeAddress The address of the bridge contract
 * @param {PublicClient} publicClient The public client instance to use for read calls
 * @param {WalletClient} walletClient The wallet client instance to use for write calls
 * @returns The contract instance
 */
export function getBridgeContract(
  bridgeAddress: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
) {
  const bridgeContract = getContract({
    address: bridgeAddress,
    abi: bridgeAbi,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });

  return bridgeContract;
}
