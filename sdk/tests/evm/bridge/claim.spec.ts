import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "@jest/globals";
import * as child from "child_process";
import {
  Address,
  createTestClient,
  TestClient,
  PublicClient,
  WalletClient,
  http,
  publicActions,
  walletActions,
  parseEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { evm } from "../../../src/";
import { AccountFixture } from "../../mocks/fixtures/privateKey";
import { receipts } from "../../mocks/fixtures/receipt";
import { waitForAnvil } from "../../mocks/anvil";
describe("Test bridge claim request", () => {
  let testClient: TestClient;
  let anvil: child.ChildProcess;
  beforeAll(async () => {
    anvil = child.spawn("anvil", [
      "-p",
      "8545",
      "-f",
      "https://network.ambrosus-test.io",
      "--silent",
    ]);
    await waitForAnvil();
  }, 15000);
  afterAll(() => {
    anvil.kill();
  }, 5000);
  beforeEach(async () => {
    testClient = createTestClient({
      mode: "anvil",
      transport: http(`http://127.0.0.1:8545`),
      account: privateKeyToAccount(AccountFixture.privateKey),
    })
      .extend(publicActions)
      .extend(walletActions);
  });
  const mockedBridgeAddress: Address =
    "0x5Bcb9233DfEbcec502C1aCce6fc94FefF8c037C3";
  test("Should call claim request successfully", async () => {
    await testClient.impersonateAccount({
      address: AccountFixture.address,
    });
    const claimParams: evm.ClaimCall = {
      receipt: receipts[1].receipt,
      signature: receipts[1].signature,
    };
    await testClient.setBalance({
      address: AccountFixture.address,
      value: parseEther("100"),
    });
    const tx = await evm.contract.calls.claimInEVM(
      claimParams,
      mockedBridgeAddress,
      testClient as unknown as PublicClient,
      testClient as unknown as WalletClient,
    );
    expect(tx).toBeDefined();
  }, 30000);

  test("Should fail claim request with token not bridgable", async () => {
    await testClient.impersonateAccount({
      address: AccountFixture.address,
    });
    const claimParams: evm.ClaimCall = {
      receipt: receipts[0].receipt,
      signature: receipts[0].signature,
    };
    await testClient.setBalance({
      address: AccountFixture.address,
      value: parseEther("100"),
    });
    await expect(
      evm.contract.calls.claimInEVM(
        claimParams,
        mockedBridgeAddress,
        testClient as unknown as PublicClient,
        testClient as unknown as WalletClient,
      ),
    ).rejects.toMatchObject({
      errorName: "TokenNotBridgable",
      errorArgs: ["0x6deE265d22085F4c0BB1582BF0BAd8a6Af0309d9"],
    });
  }, 30000);
});
