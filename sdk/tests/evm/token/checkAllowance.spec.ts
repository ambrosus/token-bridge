import { beforeEach, describe, expect, test } from "@jest/globals";
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module '@depay/web3-mock'.
import { mock, resetMocks } from "@depay/web3-mock";
import { Address, createPublicClient, custom, PublicClient } from "viem";
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
  beforeEach(() => {
    mockedPublicClient = createPublicClient({
      chain: mainnet,
      transport: custom((global as any).ethereum),
    });
  });
  const mockedTokenAddress: Address =
    "0xa0ca672481ECBCea7d4067e13F594B1426f593Ed";
  const mockedSpender: Address = "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC";
  test("Should request enough allowance successfully", async () => {
    const allowanceMock = await mock({
      blockchain,
      request: {
        to: mockedTokenAddress,
        api: evm.abi.ERC20Abi,
        method: "allowance",
        params: [accountsEvm[0], mockedSpender],
        return: "10",
      },
    });

    await expect(
      evm.helpers.checkAllowanceERC20(
        mockedTokenAddress,
        accountsEvm[0],
        mockedSpender,
        10n,
        mockedPublicClient,
      ),
    ).resolves.toBeTruthy();
    expect(allowanceMock).toHaveBeenCalled();
    expect(allowanceMock).toHaveBeenCalledTimes(1);
  });
  test("Should fail when not enough allowance", async () => {
    const allowanceMock = await mock({
      blockchain,
      request: {
        to: mockedTokenAddress,
        api: evm.abi.ERC20Abi,
        method: "allowance",
        params: [accountsEvm[0], mockedSpender],
        return: "10",
      },
    });

    await expect(
      evm.helpers.checkAllowanceERC20(
        mockedTokenAddress,
        accountsEvm[0],
        mockedSpender,
        11n,
        mockedPublicClient,
      ),
    ).rejects.toThrow("Insufficient allowance");
    expect(allowanceMock).toHaveBeenCalled();
    expect(allowanceMock).toHaveBeenCalledTimes(1);
  });
});
