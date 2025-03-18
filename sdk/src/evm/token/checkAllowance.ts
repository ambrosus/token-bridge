import { Address, erc20Abi, PublicClient } from "viem";

/**
 * Checks if an address has sufficient allowance of ERC20 token balance for a spender
 * @param {Address} tokenAddress The address of the ERC20 token
 * @param {Address} owner The address to check balance for
 * @param {Address} spender The address of the spender
 * @param {bigint} amount The required amount in wei
 * @param {PublicClient} client The public client instance to use for the query
 * @returns {Promise<boolean>} true if the allowance is enough, throws error otherwise
 * @throws Error if the allowance is not enough
 */
export async function checkAllowanceERC20(
  tokenAddress: Address,
  owner: Address,
  spender: Address,
  amount: bigint,
  client: PublicClient,
): Promise<boolean> {
  const allowedBalance = await client.readContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "allowance",
    args: [owner, spender],
  });
  if (allowedBalance < amount) {
    throw new Error("Insufficient allowance");
  }
  return true;
}
