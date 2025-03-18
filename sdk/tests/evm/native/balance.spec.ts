import { beforeEach, describe, expect, test } from "@jest/globals";
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module '@depay/web3-mock'.
import { mock, resetMocks } from "@depay/web3-mock";
import { createPublicClient, custom, PublicClient } from "viem";
import { mainnet } from "viem/chains";
import { evm } from "../../../src/";
import { accountsEvm, blockchainEvm as blockchain } from "../../mocks/contract";

describe("Test token allowance request", () => {
  beforeEach(async () => await resetMocks());
  beforeEach(
    async () =>
      await mock({
        blockchain,
        accounts: { return: accountsEvm },
      }),
  );
  let mockedPublicClient: PublicClient;
  const mockedBalance = 10000000000000000000000n;
  let balanceMock: ReturnType<typeof mock>;
  beforeEach(() => {
    mockedPublicClient = createPublicClient({
      chain: mainnet,
      transport: custom((global as any).ethereum),
    });
    balanceMock = mock({
      blockchain,
      balance: {
        for: accountsEvm[0],
        return: mockedBalance.toString(),
      },
    });
  });
  test("Should request enough balance successfully", async () => {
    await expect(
      evm.helpers.checkBalanceNative(
        accountsEvm[0],
        mockedBalance,
        mockedPublicClient,
      ),
    ).resolves.toBeTruthy();
    expect(balanceMock).toHaveBeenCalled();
    expect(balanceMock).toHaveBeenCalledTimes(1);
  });
  test("Should fail when not enough balance", async () => {
    await expect(
      evm.helpers.checkBalanceNative(
        accountsEvm[0],
        mockedBalance + 1n,
        mockedPublicClient,
      ),
    ).rejects.toThrow("Insufficient balance");
    expect(balanceMock).toHaveBeenCalled();
    expect(balanceMock).toHaveBeenCalledTimes(1);
  });
});
