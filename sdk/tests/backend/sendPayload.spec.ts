import {
  describe,
  test,
  expect,
  jest,
  afterEach,
  beforeEach,
} from "@jest/globals";
import { backend } from "../../src";

// #region mock
const sendPayloadResponse = {
  sendPayload: {
    tokenAddressFrom:
      "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
    tokenAddressTo:
      "0x0000000000000000000000002Cf845b49e1c4E5D657fbBF36E97B7B5B7B7b74b",
    amountToSend: "1000000000000000000",
    feeAmount: "1000000000000000",
    chainFrom: "6003100671677645902",
    chainTo: "22040",
    timestamp: 1742256876,
    flags: "0",
    flagData: "0x",
  },
  signature:
    "0x1a5d0d6e835ebfeeb58b3914b994032dc5646f71fa17970b40a2bdd26a9cff582c4b560c6c3012d18ccdb5416b5d49f45a39265039b6b5877354fe4238599804",
};
const sendPayloadResponse_to_svm = {
  sendPayload: {
    tokenAddressFrom:
      "0x0000000000000000000000002Cf845b49e1c4E5D657fbBF36E97B7B5B7B7b74b",
    tokenAddressTo:
      "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
    amountToSend: "1000000000000000000",
    feeAmount: "1000000000000000",
    chainFrom: "22040",
    chainTo: "6003100671677645902",
    timestamp: 1742256876,
    flags: "0",
    flagData: "0x",
  },
  signature:
    "0xe443f0b1a4d2114ad51f030571343ea723697bce49e0db5a8aa64ccf4e9d5606407d9f66d69d8f74eb40855bdfe9a195d3f38eb4ce47100c37c45ca36998c93b1c",
};
// #endregion mock

describe("Test getting send payload from backend", () => {
  let fetchMock: jest.SpiedFunction<typeof fetch>;

  const sendPayloadFetchMock = () =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: async () => sendPayloadResponse,
    } as Response);

  beforeEach(() => {
    fetchMock = jest
      .spyOn(global, "fetch")
      .mockImplementation(sendPayloadFetchMock);
  });

  afterEach(async () => jest.restoreAllMocks());

  test("Should get send payload", async () => {
    const expectedResult = {
      ...sendPayloadResponse,
      sendPayload: {
        ...sendPayloadResponse.sendPayload,
        flags: BigInt(sendPayloadResponse.sendPayload.flags),
        amountToSend: BigInt(sendPayloadResponse.sendPayload.amountToSend),
        feeAmount: BigInt(sendPayloadResponse.sendPayload.feeAmount),
        chainFrom: BigInt(sendPayloadResponse.sendPayload.chainFrom),
        chainTo: BigInt(sendPayloadResponse.sendPayload.chainTo),
        timestamp: BigInt(sendPayloadResponse.sendPayload.timestamp),
      },
    };
    await expect(
      backend.getSendPayload(
        6003100671677645902n,
        22040n,
        "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
        1000000000000000000n,
        "0x0000000000000000000000005B9E2BD997bc8f6aE97145cE0a8dEE075653f1AA",
        0n,
        "0x",
      ),
    ).resolves.toEqual(expectedResult);
    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("Should get send payload short token address out", async () => {
    const expectedResult = {
      ...sendPayloadResponse,
      sendPayload: {
        ...sendPayloadResponse.sendPayload,
        flags: BigInt(sendPayloadResponse.sendPayload.flags),
        amountToSend: BigInt(sendPayloadResponse.sendPayload.amountToSend),
        feeAmount: BigInt(sendPayloadResponse.sendPayload.feeAmount),
        chainFrom: BigInt(sendPayloadResponse.sendPayload.chainFrom),
        chainTo: BigInt(sendPayloadResponse.sendPayload.chainTo),
        timestamp: BigInt(sendPayloadResponse.sendPayload.timestamp),
      },
    };
    await expect(
      backend.getSendPayload(
        6003100671677645902n,
        22040n,
        "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
        1000000000000000000n,
        "0x5B9E2BD997bc8f6aE97145cE0a8dEE075653f1AA",
        0n,
        "0x",
      ),
    ).resolves.toEqual(expectedResult);
    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("Should get send payload short token address in", async () => {
    const expectedResult = {
      ...sendPayloadResponse_to_svm,
      sendPayload: {
        ...sendPayloadResponse_to_svm.sendPayload,
        flags: BigInt(sendPayloadResponse_to_svm.sendPayload.flags),
        amountToSend: BigInt(
          sendPayloadResponse_to_svm.sendPayload.amountToSend,
        ),
        feeAmount: BigInt(sendPayloadResponse_to_svm.sendPayload.feeAmount),
        chainFrom: BigInt(sendPayloadResponse_to_svm.sendPayload.chainFrom),
        chainTo: BigInt(sendPayloadResponse_to_svm.sendPayload.chainTo),
        timestamp: BigInt(sendPayloadResponse_to_svm.sendPayload.timestamp),
      },
    };
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: async () => sendPayloadResponse_to_svm,
      } as Response),
    );
    await expect(
      backend.getSendPayload(
        22040n,
        6003100671677645902n,
        "0x2Cf845b49e1c4E5D657fbBF36E97B7B5B7B7b74b",
        1000000000000000000n,
        "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
        0n,
        "0x",
      ),
    ).resolves.toEqual(expectedResult);
    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("Should throw error if fetch failed", async () => {
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not found",
        json: async () => ({ error: "Not found" }),
      } as Response),
    );
    await expect(
      backend.getSendPayload(
        6003100671677645902n,
        22040n,
        "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
        1000000000000000000n,
        "0x0000000000000000000000005B9E2BD997bc8f6aE97145cE0a8dEE075653f1AA",
        0n,
        "0x",
      ),
    ).rejects.toThrowError(
      'Failed to get send payload: 404, {"error":"Not found"}',
    );
    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("Should throw error if fetched invalid data", async () => {
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ sendPayload: null, signature: null }),
      } as Response),
    );
    await expect(
      backend.getSendPayload(
        6003100671677645902n,
        22040n,
        "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
        1000000000000000000n,
        "0x0000000000000000000000005B9E2BD997bc8f6aE97145cE0a8dEE075653f1AA",
      ),
    ).rejects.toThrowError("Invalid response from backend");
    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
