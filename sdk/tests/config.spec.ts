import { describe, expect, test } from "@jest/globals";
import { backendUrl, rpcs, SOLANA_CHAIN_ID, SOLANA_DEV_CHAIN_ID } from "../src";

describe("Test config", () => {
  test("Should have backendUrl", () => {
    expect(backendUrl).toBeDefined();
    expect(backendUrl).toBe("http://localhost:3000"); // Default value
  });

  test("Should have SOLANA_CHAIN_ID", () => {
    expect(SOLANA_CHAIN_ID).toBeDefined();
    expect(SOLANA_CHAIN_ID).toBe(6003100671677628416n); // Default value
  });

  test("Should have SOLANA_DEV_CHAIN_ID", () => {
    expect(SOLANA_DEV_CHAIN_ID).toBeDefined();
    expect(SOLANA_DEV_CHAIN_ID).toBe(6003100671677645902n); // Default value
  });

  test("Should have rpcs", () => {
    expect(rpcs).toBeDefined();
    Object.entries(rpcs).forEach(([rpcKey, rpcValue]) => {
      expect(rpcKey).toMatch(/RPC_URL_[0-9]+/);
      expect(rpcValue).toMatch(/ws[s]|http[s]?:\/\//);
    });
  });
});
