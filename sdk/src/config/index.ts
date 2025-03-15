import { config } from "dotenv";
import { bytesToBigInt, stringToBytes } from "viem";
import { clusterApiUrl } from "@solana/web3.js";
config();

export const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

export const SOLANA_CHAIN_ID = bytesToBigInt(
  stringToBytes("SOLANA", { size: 8 })
);
export const SOLANA_DEV_CHAIN_ID = bytesToBigInt(
  stringToBytes("SOLANADN", { size: 8 })
);

const EVMChains = {
  amb: 16718,
  "amb-test": 22040,
  "amb-dev": 30746,
  base: 8453,
  "base-test": 84532,
  bsc: 56,
  "bsc-test": 97,
  eth: 1,
};

function envRPC(chainId: number | bigint): string | undefined {
  return process.env[`RPC_URL_${chainId}`];
}

export const rpcs: Record<`RPC_URL_${number | bigint}`, string> = {
  [`RPC_URL_${SOLANA_DEV_CHAIN_ID}`]:
    envRPC(SOLANA_DEV_CHAIN_ID) || clusterApiUrl("devnet"),
  [`RPC_URL_${SOLANA_CHAIN_ID}`]:
    envRPC(SOLANA_CHAIN_ID) || clusterApiUrl("mainnet-beta"),
  [`RPC_URL_${EVMChains["amb"]}`]:
    envRPC(EVMChains["amb"]) || "https://network.ambrosus.io/",
  [`RPC_URL_${EVMChains["amb-test"]}`]:
    envRPC(EVMChains["amb-test"]) || "https://network.ambrosus-test.io/",
  [`RPC_URL_${EVMChains["amb-dev"]}`]:
    envRPC(EVMChains["amb-dev"]) || "https://network.ambrosus-dev.io/",
  [`RPC_URL_${EVMChains["base"]}`]:
    envRPC(EVMChains["base"]) || "https://mainnet.base.org",
  [`RPC_URL_${EVMChains["base-test"]}`]:
    envRPC(EVMChains["base-test"]) || "https://sepolia.base.org",
  [`RPC_URL_${EVMChains["bsc"]}`]:
    envRPC(EVMChains["bsc"]) || "https://bsc-rpc.publicnode.com",
  [`RPC_URL_${EVMChains["bsc-test"]}`]:
    envRPC(EVMChains["bsc-test"]) || "https://bsc-testnet-rpc.publicnode.com",
  [`RPC_URL_${EVMChains["eth"]}`]:
    envRPC(EVMChains["eth"]) || "https://ethereum-rpc.publicnode.com",
};
