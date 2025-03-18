import {
  describe,
  test,
  expect,
  jest,
  afterEach,
  beforeEach,
} from "@jest/globals";
import { Address } from "viem";
import { backend } from "../../src";
import {
  evmAddressToBytes32,
  solanaAddressToBytes32,
} from "../../src/evm/bridge/helpers";

// #region mock
const receiptsArray = [
  {
    receipt: {
      receiptId: "22040_6003100671677645902_2",
      timestamp: "1742202685",
      bridgeAddress: "0x48722498168d61bccfc5caa5f6082975efd92d46",
      from: "0x000000000000000000000000281dcd7124b1b6015b6c7953c9e4ae19d8d63a89",
      to: "0x75c243b6c340b2c069835be8c82b31f24e79dfcb464a784b1ed8a8c2521dfaa4",
      tokenAddressFrom:
        "0x0000000000000000000000002cf845b49e1c4e5d657fbbf36e97b7b5b7b7b74b",
      tokenAddressTo:
        "0x0cf53911c806ccffeb6a2cf754a5ec25b87f7a733cf375a90ce5faac9fcf4c5b",
      amountFrom: "5000000000000000000",
      amountTo: "5000000",
      chainFrom: "22040",
      chainTo: "6003100671677645902",
      eventId: "2",
      flags: "0",
      data: "0x0000000000000002",
      claimed: false,
    },
    receiptMeta: [
      {
        receiptId: "22040_6003100671677645902_2",
        blockHash:
          "0xb1570d38742625d2c4a08223b97c51d97b1b81dacf67bc64ae557ac58d9b1121",
        blockNumber: "3890725",
        timestamp: "1742202685",
        transactionHash:
          "0x38fe209bc8fc4912880e8008fecf21f3248ea37c9e48f9b1af3061b334627f14",
        transactionIndex: 0,
      },
    ],
  },
  {
    receipt: {
      receiptId: "22040_6003100671677645902_1",
      timestamp: "1742202480",
      bridgeAddress: "0x48722498168d61bccfc5caa5f6082975efd92d46",
      from: "0x000000000000000000000000281dcd7124b1b6015b6c7953c9e4ae19d8d63a89",
      to: "0x75c243b6c340b2c069835be8c82b31f24e79dfcb464a784b1ed8a8c2521dfaa4",
      tokenAddressFrom:
        "0x0000000000000000000000002cf845b49e1c4e5d657fbbf36e97b7b5b7b7b74b",
      tokenAddressTo:
        "0x0cf53911c806ccffeb6a2cf754a5ec25b87f7a733cf375a90ce5faac9fcf4c5b",
      amountFrom: "5000000000000000000",
      amountTo: "5000000",
      chainFrom: "22040",
      chainTo: "6003100671677645902",
      eventId: "1",
      flags: "0",
      data: "0x0000000000000001",
      claimed: false,
    },
    receiptMeta: [
      {
        receiptId: "22040_6003100671677645902_1",
        blockHash:
          "0x6b4873745b6d5940f0b7a0a9390f5f649d70381915a7c7f819d5f03340551766",
        blockNumber: "3890699",
        timestamp: "1742202480",
        transactionHash:
          "0x2be0a47b8fb2b0ed1b5f7c9e3ecf1a0cdb6dbc068dbb9bb57a75f3125a8f81ae",
        transactionIndex: 0,
      },
    ],
  },
  {
    receipt: {
      receiptId: "22040_6003100671677645902_0",
      timestamp: "1741953110",
      bridgeAddress: "0x48722498168d61bccfc5caa5f6082975efd92d46",
      from: "0x000000000000000000000000281dcd7124b1b6015b6c7953c9e4ae19d8d63a89",
      to: "0xd546c11618edd8d6517f9e6511398f67c8626e74c00be837791f07903ad095dd",
      tokenAddressFrom:
        "0x0000000000000000000000002cf845b49e1c4e5d657fbbf36e97b7b5b7b7b74b",
      tokenAddressTo:
        "0x0cf53911c806ccffeb6a2cf754a5ec25b87f7a733cf375a90ce5faac9fcf4c5b",
      amountFrom: "10000000000000000000",
      amountTo: "10000000",
      chainFrom: "22040",
      chainTo: "6003100671677645902",
      eventId: "0",
      flags: "0",
      data: "0x0000000000000000",
      claimed: false,
    },
    receiptMeta: [
      {
        receiptId: "22040_6003100671677645902_0",
        blockHash:
          "0x69a0e15965dda31b20536c05fe5957794e08fb442f839a6a86d7e3112aaf41d1",
        blockNumber: "3857315",
        timestamp: "1741953110",
        transactionHash:
          "0x2d0153080afa8f2ea2996a88dfa4e776241cce6693cf85718db4f72a54de39be",
        transactionIndex: 0,
      },
    ],
  },
];

const signatures = [
  {
    receiptId: "22040_6003100671677645902_0",
    signatures: [
      {
        receiptId: "22040_6003100671677645902_0",
        signedBy: "5LEctUbBJ3RDBsaz2ZRfvrCUT7S36bUHe58ebiymSLuU",
        signature:
          "0x239d9cc14e0dfffe4511061ddc65f1f997aa83189b15886c7f11c3a1c6e57f592de64d8cb72c7bde1ada547e776e8d391957b94d45b4acb8e51664c174bef105",
      },
      {
        receiptId: "22040_6003100671677645902_0",
        signedBy: "AgsF8YRCHEWwRDJJE6pRTN3YP86qZbqToKE2k6eiGGJ1",
        signature:
          "0x9959179e3c09b72e6a71a37e531b0be9b5b5dbef6f9258c81a7337cfaacb563ba68301e60ba825ed1c8b3bf41337ca5da8d6b6f7d7708b53dbb1235b3adcb50d",
      },
      {
        receiptId: "22040_6003100671677645902_0",
        signedBy: "BxjUNyhbM8je1ynfPcEuihYdi1qB7EkjuL1N8zgZWczx",
        signature:
          "0x8c83d9d684a36cb58fe50c143e9945358dcd0ba263592fa1590740b4fb77dc7ada6a63246aea6f9029e3fa4daf89af91088c054d28b37ae4ae6a84ac8c656e0b",
      },
      {
        receiptId: "22040_6003100671677645902_0",
        signedBy: "GCSfaYKrPKirtS33JzVZbAZmbwyGenWTXx9Zf77qo882",
        signature:
          "0x97c37ddfd0a87260a79e3a5c6a6516c56e83402064f9867be2298ec41221c03b79269cf9410fff2cd2d0aed1ad66a1c2c94b9659f9045de2cf8c11386a60e60f",
      },
      {
        receiptId: "22040_6003100671677645902_0",
        signedBy: "HovoifHQnmogSutaxjNSptz2BV8LoPkP2V6omrjYE9Tp",
        signature:
          "0x309dd2254c3817272eb25e3543f2ee06278ca6f6e329cd8faec2e82c855d0c69dbd4a4e524f544172c60805c9d4f5ea631aece5c5e738a2cb20084823870bb08",
      },
      {
        receiptId: "22040_6003100671677645902_0",
        signedBy: "T9VhfHpg2616B4cSLtc4DDqbuMJWv2yEuN1xGAtXStP",
        signature:
          "0x74ac22e84e93228997ab52a285c60e49e3cdc3fd83c217b50cfb43fd2e3857b3ce095350e6dafc21e8146543eaaefe058951aba11138cc342a4d98da0d58e806",
      },
    ],
  },
  {
    receiptId: "22040_6003100671677645902_1",
    signatures: [
      {
        receiptId: "22040_6003100671677645902_1",
        signedBy: "5LEctUbBJ3RDBsaz2ZRfvrCUT7S36bUHe58ebiymSLuU",
        signature:
          "0x73242f1d223f55ac014dbe99d3dc33f94bf58a658dd8e0db01288960a69b654dc7d49c3370217fe8129ab037cd62d5eddad25aa6cc817c83f3354281f8aacb03",
      },
      {
        receiptId: "22040_6003100671677645902_1",
        signedBy: "AgsF8YRCHEWwRDJJE6pRTN3YP86qZbqToKE2k6eiGGJ1",
        signature:
          "0x8e6a0064cd5fb7c2a355ea5f8d9312f0bb27dad185ff3137f1f9955c8f3417fbe789781f8f6a6c60519372bdcb703cfc42fbb907c60f946e926a35e8eb7b3f0e",
      },
      {
        receiptId: "22040_6003100671677645902_1",
        signedBy: "BxjUNyhbM8je1ynfPcEuihYdi1qB7EkjuL1N8zgZWczx",
        signature:
          "0x0597ca13b8436250a15eed9e57082bb172a660f37bba9345a3f481b8accbc7c0a8b2bc13844d320331b0149c9aa96515f807877ecb5c5d73b5971917b6064a0f",
      },
      {
        receiptId: "22040_6003100671677645902_1",
        signedBy: "HovoifHQnmogSutaxjNSptz2BV8LoPkP2V6omrjYE9Tp",
        signature:
          "0xbff6a5b6a0f01209fdcc4bd33f182938945f7dc6d27d4e0f09da64ed9d30dd2df3525f4158bad3e9bc122f6d25082834ac08a917bf1d0a42b7b75be46b6b8202",
      },
      {
        receiptId: "22040_6003100671677645902_1",
        signedBy: "T9VhfHpg2616B4cSLtc4DDqbuMJWv2yEuN1xGAtXStP",
        signature:
          "0xc63eca50f8f7e6f988167779d83bcbaaf1a8a28aa48180f15d961f3fb80fb54bd020b2747d9a05570f4b853bdfa69f14c60af6d8705794da6946e833104b7504",
      },
    ],
  },
  {
    receiptId: "22040_6003100671677645902_2",
    signatures: [
      {
        receiptId: "22040_6003100671677645902_2",
        signedBy: "5LEctUbBJ3RDBsaz2ZRfvrCUT7S36bUHe58ebiymSLuU",
        signature:
          "0x1d2ecf8ee6abebbcd58edaee0279280872dcba93ce646c9dbffc6718a7006370571c0a932b7a18d6d124466c1d01dd10a187651b9136911231c77fb2da5ccd0b",
      },
      {
        receiptId: "22040_6003100671677645902_2",
        signedBy: "AgsF8YRCHEWwRDJJE6pRTN3YP86qZbqToKE2k6eiGGJ1",
        signature:
          "0xa2632807114b2e952c12901653a096fd4b2ea07cc82004be7dba72f5c63d505e0cb617f4b291caa92d863582774686de1babaf6e07423bb5edb0fadcda7d8a00",
      },
      {
        receiptId: "22040_6003100671677645902_2",
        signedBy: "BxjUNyhbM8je1ynfPcEuihYdi1qB7EkjuL1N8zgZWczx",
        signature:
          "0x3527fe72833e742bf9f7e4c22555cea1d10ac8156e8928fe2b6e45b9785d42af3e4dfa923c6d20cdc846fd62a6aa79b2861a805c5689b0f1514f30a835065c04",
      },
      {
        receiptId: "22040_6003100671677645902_2",
        signedBy: "HovoifHQnmogSutaxjNSptz2BV8LoPkP2V6omrjYE9Tp",
        signature:
          "0x2b44106d4720bc4f032ce81083bcfeb76d3ece88e28e5ac31599700a4f3666b0edf1babeaf3d6946176e01eb9e096ca1ab703c71fd271f279fd31ab8716dd902",
      },
      {
        receiptId: "22040_6003100671677645902_2",
        signedBy: "T9VhfHpg2616B4cSLtc4DDqbuMJWv2yEuN1xGAtXStP",
        signature:
          "0x35084507fbd47d8a3e00bef54fc34ae6beceb7e8c15242667ae66400d0c71798d913aa60a8f09f8fa9f5d82009ae3952ce480526ee428363c1df6b785f88dd03",
      },
    ],
  },
];
// #endregion mock

describe("Test getting receipt from backend", () => {
  let fetchMock: jest.SpiedFunction<typeof fetch>;

  afterEach(async () => jest.restoreAllMocks());

  describe("By receiptId", () => {
    const receiptByIdFetchMock = (input: URL | string | Request) => {
      let receiptId = input.toString().split("/").pop();
      if (input instanceof URL) {
        receiptId = input.pathname.split("/").pop();
      } else if (input instanceof Request) {
        receiptId = input.url.split("/").pop();
      } else {
        receiptId = input.split("/").pop();
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () =>
          receiptsArray.find(
            (receipt) => receipt.receipt.receiptId === receiptId,
          ),
      } as Response);
    };

    beforeEach(() => {
      fetchMock = jest
        .spyOn(global, "fetch")
        .mockImplementation(receiptByIdFetchMock);
    });

    test.each(receiptsArray.map((entry) => entry.receipt.receiptId))(
      "Should get receipt by receiptId",
      async (receiptId) => {
        const expectedReceipt = backend.parseReceiptWithMeta(
          receiptsArray.find(
            (receipt) => receipt.receipt.receiptId === receiptId,
          )!,
        );
        await expect(backend.getReceipt(receiptId)).resolves.toEqual(
          expectedReceipt,
        );
        expect(fetchMock).toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledTimes(1);
      },
    );

    test("Should fail to get receipt by receiptId", async () => {
      fetchMock.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: "Not found",
          json: async () => ({ error: "Not found" }),
        } as Response),
      );
      await expect(
        backend.getReceipt("22040_6003100671677645902_0"),
      ).rejects.toThrowError(
        'Failed to get receipt: 404, {"error":"Not found"}',
      );
      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
  describe("By address", () => {
    const receiptByAddressFetchMock = (input: URL | string | Request) => {
      let address = input.toString().split("/").pop();
      if (input instanceof URL) {
        address = input.pathname.split("/").pop();
      } else if (input instanceof Request) {
        address = input.url.split("/").pop();
      } else {
        address = input.split("/").pop();
      }
      const B32 = address?.startsWith("0x")
        ? evmAddressToBytes32(address! as Address)
        : solanaAddressToBytes32(address!);
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () =>
          receiptsArray.filter(
            (receipt) =>
              receipt.receipt.from === B32 || receipt.receipt.to === B32,
          ),
      } as Response);
    };

    beforeEach(() => {
      fetchMock = jest
        .spyOn(global, "fetch")
        .mockImplementation(receiptByAddressFetchMock);
    });

    test.each([
      "0x281dcd7124b1b6015b6c7953c9e4ae19d8d63a89",
      "8vgWXnv9x7bYLvsrVodPG6QMU7V5yZDQMQ5DkA42pWVq",
      "FMYR5BFh3JapZS1cfwYViiBMYJxFGwKdchnghBnBtxkk",
    ])("Should get receipt by address", async (address) => {
      const B32 = address.startsWith("0x")
        ? evmAddressToBytes32(address as Address)
        : solanaAddressToBytes32(address);
      const expectedReceipts = receiptsArray
        .filter(
          (receipt) =>
            receipt.receipt.from === B32 || receipt.receipt.to === B32,
        )
        .map(backend.parseReceiptWithMeta);
      await expect(backend.getReceiptsByAddress(address)).resolves.toEqual(
        expectedReceipts,
      );
      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test("Should fail to get receipt by address", async () => {
      fetchMock.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: "Not found",
          json: async () => ({ error: "Not found" }),
        } as Response),
      );
      await expect(
        backend.getReceiptsByAddress(
          "0x281dcd7124b1b6015b6c7953c9e4ae19d8d63a89",
        ),
      ).rejects.toThrowError(
        'Failed to get receipts by address: 404, {"error":"Not found"}',
      );
      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
  describe("All receipts", () => {
    const allReceiptsFetchMock = () => {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => receiptsArray,
      } as Response);
    };

    beforeEach(() => {
      fetchMock = jest
        .spyOn(global, "fetch")
        .mockImplementation(allReceiptsFetchMock);
    });

    test("Should get all receipts", async () => {
      const expectedReceipts = receiptsArray.map(backend.parseReceiptWithMeta);
      await expect(backend.getAllReceipts()).resolves.toEqual(expectedReceipts);
      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    test("Should fail to get all receipts", async () => {
      fetchMock.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: "Not found",
          json: async () => ({ error: "Not found" }),
        } as Response),
      );
      await expect(backend.getAllReceipts()).rejects.toThrowError(
        'Failed to get receipts: 404, {"error":"Not found"}',
      );
      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
  describe("Signatures for receipts", () => {
    const signaturesFetchMock = (input: URL | string | Request) => {
      let receiptId = input.toString().split("/").pop();
      if (input instanceof URL) {
        receiptId = input.pathname.split("/").pop();
      } else if (input instanceof Request) {
        receiptId = input.url.split("/").pop();
      } else {
        receiptId = input.split("/").pop();
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () =>
          signatures.find((signature) => signature.receiptId === receiptId),
      } as Response);
    };

    beforeEach(() => {
      fetchMock = jest
        .spyOn(global, "fetch")
        .mockImplementation(signaturesFetchMock);
    });

    test.each(signatures.map((entry) => entry.receiptId))(
      "Should get signatures for receipt",
      async (receiptId) => {
        const expectedSignatures = signatures.find(
          (signature) => signature.receiptId === receiptId,
        );
        await expect(backend.getReceiptSignature(receiptId)).resolves.toEqual(
          expectedSignatures,
        );
        expect(fetchMock).toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledTimes(1);
      },
    );

    test("Should fail to get signatures for receipt", async () => {
      fetchMock.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: "Not found",
          json: async () => ({ error: "Not found" }),
        } as Response),
      );
      await expect(
        backend.getReceiptSignature("22040_6003100671677645902_0"),
      ).rejects.toThrowError(
        'Failed to get receipt: 404, {"error":"Not found"}',
      );
      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("By txHash", () => {
    const receiptByTxHashFetchMock = (input: URL | string | Request) => {
      let txHash = input.toString().split("/").pop();
      if (input instanceof URL) {
        txHash = input.pathname.split("/").pop();
      } else if (input instanceof Request) {
        txHash = input.url.split("/").pop();
      } else {
        txHash = input.split("/").pop();
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          receiptId: receiptsArray.find(
            (receipt) =>
              receipt.receiptMeta.find(
                (meta) => meta.transactionHash === txHash,
              ) !== undefined,
          )?.receipt.receiptId,
        }),
      } as Response);
    };

    beforeEach(() => {
      fetchMock = jest
        .spyOn(global, "fetch")
        .mockImplementation(receiptByTxHashFetchMock);
    });

    test.each(
      receiptsArray.map((entry) => [
        entry.receiptMeta[0].transactionHash,
        entry.receipt.receiptId,
      ]),
    )("Should get receiptId by txHash", async (hash, expectedId) => {
      await expect(backend.getReceiptIdByTxHash(hash)).resolves.toEqual(
        expectedId,
      );
      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test("Should fail to get receiptId by txHash", async () => {
      fetchMock.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: "Not found",
          json: async () => ({ error: "Not found" }),
        } as Response),
      );
      await expect(
        backend.getReceiptIdByTxHash(
          "0x38fe209bc8fc4912880e8008fecf21f3248ea37c9e48f9b1af3061b334627f14",
        ),
      ).rejects.toThrowError(
        'Failed to get receipt by tx hash: 404, {"error":"Not found"}',
      );
      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
