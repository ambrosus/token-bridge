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
  Hex,
  createTestClient,
  TestClient,
  PublicClient,
  toHex,
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

async function waitForAnvil(retries = 0) {
  try {
    const url = `http://127.0.0.1:8545`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_blockNumber",
        params: [],
      }),
    });
    return response.ok && (await response.json()) !== undefined;
  } catch (error) {
    console.log("Anvil is not ready yet");
    if (retries > 10) {
      throw new Error("Anvil is not ready");
    } else {
      return await new Promise((resolve) => {
        setTimeout(() => resolve(waitForAnvil(retries++)), 1000);
      });
    }
  }
}
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
      address: testClient.account?.address!,
      value: parseEther("100"),
    });
    const tx = await evm.contract.calls.claimInEVM(
      claimParams,
      mockedBridgeAddress,
      testClient as unknown as PublicClient,
      testClient as unknown as WalletClient
    );
    expect(tx).toBeDefined();
  }, 30000);
});
