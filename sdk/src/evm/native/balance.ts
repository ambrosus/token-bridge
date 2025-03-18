import { Address, PublicClient } from "viem";

/**
 * Checks if an address has sufficient native coin balance
 * @param owner The address to check balance for
 * @param amount The required amount in wei
 * @param client The public client instance to use for the query
 * @returns true if the balance is sufficient, throws error otherwise
 * @throws Error if the balance is insufficient
 */
export async function checkBalanceNative(
  owner: Address,
  amount: bigint,
  client: PublicClient
): Promise<boolean> {
  const balance = await client.getBalance({
    address: owner,
  });
  if (balance < amount) {
    throw new Error("Insufficient balance");
  }
  return true;
}
