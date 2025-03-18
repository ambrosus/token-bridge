import { describe, expect, test } from "@jest/globals";
import { Address, Hex } from "viem";
import { evm } from "../../../src";
import { receipts } from "../../mocks/fixtures/receipt";
import { SendPayload } from "../../../src/backend";

describe("Test bridge helpers", () => {
  test.each<[Address, Hex]>([
    [
      "0xe9882a518D20F856f2f8A5af2c8098eBDc186876",
      "0x000000000000000000000000e9882a518d20f856f2f8a5af2c8098ebdc186876",
    ],
    [
      "0x428a7d66E2CA1F00F71a9DDc9bffF02fbd5910FF",
      "0x000000000000000000000000428a7d66e2ca1f00f71a9ddc9bfff02fbd5910ff",
    ],
    [
      "0x65dF51CA9E034968AcA075F9a92C3fC57EaaE3Bd",
      "0x00000000000000000000000065df51ca9e034968aca075f9a92c3fc57eaae3bd",
    ],
    [
      "0xaa967e874087E425516d36Fd8cF06A28146c345D",
      "0x000000000000000000000000aa967e874087e425516d36fd8cf06a28146c345d",
    ],
    [
      "0xd5b75805F56000f9F1B275f3b093bE92A98384b2",
      "0x000000000000000000000000d5b75805f56000f9f1b275f3b093be92a98384b2",
    ],
    [
      "0x1F7b9B134362a80aDc825fFDc91E0E5669575Be5",
      "0x0000000000000000000000001f7b9b134362a80adc825ffdc91e0e5669575be5",
    ],
  ])(
    "Should correctly convert evm address to bytes32 hex",
    (address, expectedHex) => {
      expect(evm.helpers.evmAddressToBytes32(address)).toBe(expectedHex);
      expect(evm.helpers.addressToBytes32(address)).toBe(expectedHex);
    },
  );

  test.each<[string, Hex]>([
    [
      "ambZMSUBvU8bLfxop5uupQd9tcafeJKea1KoyTv2yM1",
      "0x08a6976346b7171e4240d4b44ef7e80dd595aca0cefbb3f8927d236252a86420",
    ],
    [
      "samb9vCFCTEvoi3eWDErSCb5GvTq8Kgv6VKSqvt7pgi",
      "0x0cf53911c806ccffeb6a2cf754a5ec25b87f7a733cf375a90ce5faac9fcf4c5b",
    ],
    [
      "usdc3xpQ18NLAumSUvadS62srrkxQWrvQHugk8Nv7MA",
      "0x0d8b736adf5b3cad0c946e2b48d184b299fcb25ed09eb55b444b99284fe3f5a1",
    ],
    [
      "So11111111111111111111111111111111111111112",
      "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
    ],
  ])(
    "Should correctly convert solana address to bytes32 hex",
    (address, expectedHex) => {
      expect(evm.helpers.solanaAddressToBytes32(address)).toBe(expectedHex);
      expect(evm.helpers.base58AddressToBytes32(address)).toBe(expectedHex);
    },
  );

  test.each<[Hex[], Hex]>([
    [
      [
        "0x440b75cd3d29d71955c4a67f5fcbb576796b7190dd2ff37eba6d091a7ecab5434f78f02dc510317398657585b6272daf8620b4b9f6c6dadafcd659ce3ad5d24c1c",
        "0x090ef06258bd9a1535e275c6f1823044293f22ade0dd3119c3aedf4bf2ad2c1146e13bba2d2f45dafbf9ec036db5de831f52c9f93c588c8600e7082783d37d1f1b",
        "0xd309e758c57162a69ffaa26e641226e9d0de8449ead4bed78e5a77095d5d2c0d0765ccb7cd2c1dd9cc2cea7f533e7806c60d6a4e63b98cb6dc48e7d267a794381c",
        "0x8efc63bcde9486b9f71ebc9e031d1edb9df1f51dbfda5bae23b6f78c59041b19153f9d446b1524c2648a53ace16c85139c4c35363da5bd2c424ea9c13adc46441b",
        "0xa14da211c0c9ca67020d4dc7f1f4cf6fe67ea7e12853ab95f17aec6f60c6652b5a67c9794b65dd450c8cbaa4c5d22aeadd56fee00e1669ad74b5845cbc5bdb2c1c",
      ],
      "0x440b75cd3d29d71955c4a67f5fcbb576796b7190dd2ff37eba6d091a7ecab5434f78f02dc510317398657585b6272daf8620b4b9f6c6dadafcd659ce3ad5d24c1c090ef06258bd9a1535e275c6f1823044293f22ade0dd3119c3aedf4bf2ad2c1146e13bba2d2f45dafbf9ec036db5de831f52c9f93c588c8600e7082783d37d1f1bd309e758c57162a69ffaa26e641226e9d0de8449ead4bed78e5a77095d5d2c0d0765ccb7cd2c1dd9cc2cea7f533e7806c60d6a4e63b98cb6dc48e7d267a794381c8efc63bcde9486b9f71ebc9e031d1edb9df1f51dbfda5bae23b6f78c59041b19153f9d446b1524c2648a53ace16c85139c4c35363da5bd2c424ea9c13adc46441ba14da211c0c9ca67020d4dc7f1f4cf6fe67ea7e12853ab95f17aec6f60c6652b5a67c9794b65dd450c8cbaa4c5d22aeadd56fee00e1669ad74b5845cbc5bdb2c1c",
    ],
    [
      [
        "0x405c31f0761aaa578d5787a04d34ab23d3b2dc361bbb14d11418d1609fae0a32764617045847a0d4b7cc4200ffda2ef78872c7e4d61acd48f091616a974241391b",
        "0xdaeb5eb975e074a6496db13626b393f09618dd6470d721c32c86690c7d535d962eea48251daab4247b539ff783dcae36d65a1030f3de1cd871e3f5ce3f6eeccb1b",
        "0xbba19d41c301e09dca8513a4dfffe2c29eacec0765d4e7ebcdeb405517b8d4e069d18fbd67316d19b96d80db4f83bd4649dd2585e3165bb742a5f6b5d7d889591c",
      ],
      "0x405c31f0761aaa578d5787a04d34ab23d3b2dc361bbb14d11418d1609fae0a32764617045847a0d4b7cc4200ffda2ef78872c7e4d61acd48f091616a974241391bdaeb5eb975e074a6496db13626b393f09618dd6470d721c32c86690c7d535d962eea48251daab4247b539ff783dcae36d65a1030f3de1cd871e3f5ce3f6eeccb1bbba19d41c301e09dca8513a4dfffe2c29eacec0765d4e7ebcdeb405517b8d4e069d18fbd67316d19b96d80db4f83bd4649dd2585e3165bb742a5f6b5d7d889591c",
    ],
    [
      [
        "0xc7a4c265731ca4fe61374e8842fd2892dd1140fb669a5545f39ee943d85f8a6478fc5fd7948092e1d0d8a84292f9cc51a2dd10c86e76dd401617e7fdbcee630b1c",
      ],
      "0xc7a4c265731ca4fe61374e8842fd2892dd1140fb669a5545f39ee943d85f8a6478fc5fd7948092e1d0d8a84292f9cc51a2dd10c86e76dd401617e7fdbcee630b1c",
    ],
  ])(
    "Should correctly gather signatures for claim",
    (signatures, expectedHex) => {
      expect(evm.helpers.gatherSignaturesForClaim(signatures)).toBe(
        expectedHex,
      );
    },
  );

  test.each<[evm.FullReceipt | evm.MiniReceipt, Hex]>(
    receipts
      .map<
        [evm.FullReceipt | evm.MiniReceipt, Hex]
      >((entry) => [entry.receipt, entry.hash])
      .concat(
        receipts.map<[evm.FullReceipt | evm.MiniReceipt, Hex]>((entry) => [
          evm.helpers.full2miniReceipt(entry.receipt),
          entry.hash,
        ]),
      ),
  )(`Should correctly convert receipt to hash`, (receipt, expectedHash) => {
    expect(evm.helpers.hashReceipt(receipt)).toBe(expectedHash);
  });

  test("Should throw an error when trying to convert invalid solana address", () => {
    expect(() =>
      evm.helpers.evmAddressToBytes32(
        "0x56d78f233132a401208e5ba9b7959aa22719eeb4213283e299d57195399f648e",
      ),
    ).toThrow("Possibly invalid evm address");
    expect(() =>
      evm.helpers.addressToBytes32(
        "0x56d78f233132a401208e5ba9b7959aa22719eeb4213283e299d57195399f648e",
      ),
    ).toThrow("Possibly invalid evm address");
  });

  test("Should throw an error when trying to convert invalid solana address", () => {
    expect(() =>
      evm.helpers.solanaAddressToBytes32("2NEpo7TZRRrLZSi2U"),
    ).toThrow("Possibly invalid solana address");
    expect(() =>
      evm.helpers.base58AddressToBytes32("2NEpo7TZRRrLZSi2U"),
    ).toThrow("Possibly invalid solana address");
  });

  test("Api Payload to Call Payload", () => {
    const apiPayload: SendPayload = {
      tokenAddressFrom:
        "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
      tokenAddressTo: "0x5b9e2bd997bc8f6ae97145ce0a8dee075653f1aa",
      amountToSend: 1000000000000000000n,
      feeAmount: 1000000000000000n,
      chainFrom: 6003100671677645902n,
      chainTo: 22040n,
      timestamp: 1742256876n,
      flags: 0n,
      flagData: "0x",
    };

    const expectedCallPayload: evm.SendPayloadEVM = {
      tokenAddress:
        "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
      externalTokenAddress: "0x5b9e2bd997bc8f6ae97145ce0a8dee075653f1aa",
      amountToSend: 1000000000000000000n,
      feeAmount: 1000000000000000n,
      chainFrom: 6003100671677645902n,
      chainTo: 22040n,
      timestamp: 1742256876n,
      flags: 0n,
      flagData: "0x",
    };
    expect(evm.helpers.apiPayloadToCallPayload(apiPayload)).toStrictEqual(
      expectedCallPayload,
    );
  });
});
