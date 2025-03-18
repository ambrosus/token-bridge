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
const tokenConfig = {
  bridges: {
    "sol-dev": {
      "amb-test": "0x48722498168d61bcCfc5CAA5F6082975EfD92d46",
      side: "ambZMSUBvU8bLfxop5uupQd9tcafeJKea1KoyTv2yM1",
    },
  },
  tokens: {
    TKN: {
      isActive: true,
      name: "Mock Token",
      symbol: "TKN",
      denomination: 18,
      decimals: {
        "amb-test": 18,
        "base-test": 18,
        amb: 18,
        base: 18,
        sol: 6,
        "sol-dev": 6,
      },
      logo: "https://media-exp1.licdn.com/dms/image/C560BAQFuR2Fncbgbtg/company-logo_200_200/0/1636390910839?e=2159024400&v=beta&t=W0WA5w02tIEH859mVypmzB_FPn29tS5JqTEYr4EYvps",
      primaryNets: ["amb", "amb-test"],
      addresses: {
        "amb-test": "0x2Cf845b49e1c4E5D657fbBF36E97B7B5B7B7b74b",
        "sol-dev": "samb9vCFCTEvoi3eWDErSCb5GvTq8Kgv6VKSqvt7pgi",
      },
      nativeAnalog: "AMB",
    },
  },
};
// #endregion mock

describe("Test getting token config from backend", () => {
  let fetchMock: jest.SpiedFunction<typeof fetch>;

  const tokenConfigFetchMock = (input: URL | string | Request) =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: async () => tokenConfig,
    } as Response);

  beforeEach(() => {
    fetchMock = jest
      .spyOn(global, "fetch")
      .mockImplementation(tokenConfigFetchMock);
  });

  afterEach(async () => jest.restoreAllMocks());

  test("Should get token config", async () => {
    const expectedResult = tokenConfig;
    await expect(backend.getTokensConfig()).resolves.toEqual(expectedResult);
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
    await expect(backend.getTokensConfig()).rejects.toThrowError(
      'Failed to get tokens config: 404, {"error":"Not found"}',
    );
    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
