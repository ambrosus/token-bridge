import { PublicClient, WalletClient, getContract, Address } from "viem";
import { bridgeAbi } from "../abi/bridgeAbi";

export function getBridgeContract(
  bridgeAddress: Address,
  publicClient: PublicClient,
  walletClient: WalletClient
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
