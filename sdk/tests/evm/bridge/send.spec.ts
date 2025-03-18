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
  getContract,
  Abi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { evm } from "../../../src/";
import { AccountFixture } from "../../mocks/fixtures/privateKey";
import { waitForAnvil } from "../../mocks/anvil";
// #region SAMB ABI
const sAMBAbi: Abi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "name_",
        type: "string",
        internalType: "string",
      },
      {
        name: "symbol_",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "spender",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      {
        name: "spender",
        type: "address",
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deposit",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "spender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Deposit",
    inputs: [
      {
        name: "dst",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Withdrawal",
    inputs: [
      {
        name: "src",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "ERC20InsufficientAllowance",
    inputs: [
      {
        name: "spender",
        type: "address",
        internalType: "address",
      },
      {
        name: "allowance",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "needed",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "ERC20InsufficientBalance",
    inputs: [
      {
        name: "sender",
        type: "address",
        internalType: "address",
      },
      {
        name: "balance",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "needed",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "ERC20InvalidApprover",
    inputs: [
      {
        name: "approver",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC20InvalidReceiver",
    inputs: [
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC20InvalidSender",
    inputs: [
      {
        name: "sender",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC20InvalidSpender",
    inputs: [
      {
        name: "spender",
        type: "address",
        internalType: "address",
      },
    ],
  },
];
// #endregion

describe("Test bridge send request", () => {
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
  const mockedRecipient: Hex = toHex("Bob", { size: 32 });
  const mockedSignature: Hex =
    "0x4c5908107ce8fe51ac8c09188bb817c070ffed724b52bc8b29baf9905b76efe314392dbf9ace7e23aa3be2113ffb97fe9af438c4ff393d5a0de37b1ba2a28e211b";
  const mockedPayload: evm.SendPayloadEVM = {
    amountToSend: 1000000000000000000n,
    chainFrom: 22040n,
    chainTo: 6003100671677645902n,
    externalTokenAddress:
      "0x0cf53911c806ccffeb6a2cf754a5ec25b87f7a733cf375a90ce5faac9fcf4c5b",
    feeAmount: 585666821314334878500n,
    flagData: "0x",
    flags: 0n,
    timestamp: 1741897441,
    tokenAddress:
      "0x0000000000000000000000002Cf845b49e1c4E5D657fbBF36E97B7B5B7B7b74b",
  };
  test("Should call send with approve request successfully", async () => {
    await testClient.impersonateAccount({
      address: AccountFixture.address,
    });
    const sendParams: evm.SendCall = {
      recipient: mockedRecipient,
      payload: mockedPayload,
      payloadSignature: mockedSignature,
    };
    await testClient.setBalance({
      address: AccountFixture.address,
      value:
        mockedPayload.amountToSend +
        mockedPayload.feeAmount +
        parseEther("100"),
    });
    const sAmb = await getContract({
      address: ("0x" + mockedPayload.tokenAddress.slice(-40)) as Address,
      abi: sAMBAbi,
      client: {
        public: testClient as unknown as PublicClient,
        wallet: testClient as unknown as WalletClient,
      },
    });
    await sAmb.write.deposit([], { value: mockedPayload.amountToSend });
    await sAmb.write.approve([mockedBridgeAddress, mockedPayload.amountToSend]);
    const tx = await evm.contract.calls.sendFromEVM(
      sendParams,
      mockedBridgeAddress,
      testClient as unknown as PublicClient,
      testClient as unknown as WalletClient,
    );
    expect(tx).toBeDefined();
  }, 30000);

  test("Should fail send with approve request with insufficient allowance", async () => {
    await testClient.impersonateAccount({
      address: AccountFixture.address,
    });
    const sendParams: evm.SendCall = {
      recipient: mockedRecipient,
      payload: mockedPayload,
      payloadSignature: mockedSignature,
    };
    await testClient.setBalance({
      address: AccountFixture.address,
      value:
        mockedPayload.amountToSend +
        mockedPayload.feeAmount +
        parseEther("100"),
    });
    const sAmb = await getContract({
      address: ("0x" + mockedPayload.tokenAddress.slice(-40)) as Address,
      abi: sAMBAbi,
      client: {
        public: testClient as unknown as PublicClient,
        wallet: testClient as unknown as WalletClient,
      },
    });
    await sAmb.write.deposit([], { value: mockedPayload.amountToSend });
    await expect(
      evm.contract.calls.sendFromEVM(
        sendParams,
        mockedBridgeAddress,
        testClient as unknown as PublicClient,
        testClient as unknown as WalletClient,
      ),
    ).rejects.toThrow("Insufficient allowance");
  });
  test("Should fail send with approve request with insufficient balance", async () => {
    await testClient.impersonateAccount({
      address: AccountFixture.address,
    });
    const sendParams: evm.SendCall = {
      recipient: mockedRecipient,
      payload: mockedPayload,
      payloadSignature: mockedSignature,
    };
    await testClient.setBalance({
      address: AccountFixture.address,
      value: mockedPayload.amountToSend + parseEther("0.001"),
    });
    const sAmb = await getContract({
      address: ("0x" + mockedPayload.tokenAddress.slice(-40)) as Address,
      abi: sAMBAbi,
      client: {
        public: testClient as unknown as PublicClient,
        wallet: testClient as unknown as WalletClient,
      },
    });
    await sAmb.write.deposit([], { value: mockedPayload.amountToSend });
    await sAmb.write.approve([mockedBridgeAddress, mockedPayload.amountToSend]);
    await expect(
      evm.contract.calls.sendFromEVM(
        sendParams,
        mockedBridgeAddress,
        testClient as unknown as PublicClient,
        testClient as unknown as WalletClient,
      ),
    ).rejects.toThrow("Insufficient balance");
  });

  test("Should fail send with approve request with RPC error", async () => {
    await testClient.impersonateAccount({
      address: AccountFixture.address,
    });
    const sendParams: evm.SendCall = {
      recipient: mockedRecipient,
      payload: mockedPayload,
      payloadSignature: "0x".padEnd(132, "deadBeef") as Hex,
    };
    await testClient.setBalance({
      address: AccountFixture.address,
      value:
        mockedPayload.amountToSend +
        mockedPayload.feeAmount +
        parseEther("100"),
    });
    const sAmb = await getContract({
      address: ("0x" + mockedPayload.tokenAddress.slice(-40)) as Address,
      abi: sAMBAbi,
      client: {
        public: testClient as unknown as PublicClient,
        wallet: testClient as unknown as WalletClient,
      },
    });
    await sAmb.write.deposit([], { value: mockedPayload.amountToSend });
    await sAmb.write.approve([mockedBridgeAddress, mockedPayload.amountToSend]);
    await expect(
      evm.contract.calls.sendFromEVM(
        sendParams,
        mockedBridgeAddress,
        testClient as unknown as PublicClient,
        testClient as unknown as WalletClient,
      ),
    ).rejects.toMatchObject({
      errorName: "ECDSAInvalidSignatureS",
      errorArgs: [
        "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      ],
    });
  });
});
