import { Buffer } from "buffer";
import { Connection, Keypair, PublicKey, type Signer } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, } from "@solana/spl-token";
import { Program } from "@coral-xyz/anchor";
import type { AmbSolBridge } from "../idl/idlType";

export const SOLANA_CHAIN_ID = 0x534f4c414e41444en;  // "SOLANADN"
export const AMB_CHAIN_ID = 22040;


export function hexToUint8Array(hexString: string) {
  hexString = hexString.replace("0x", "");
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < bytes.length; i++)
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  return bytes;
}


export function numberToUint8Array(num: number, length = 8) {
  return bignumberToUint8Array(BigInt(num), length);
}

export function bignumberToUint8Array(num: bigint, length = 8) {
  if (num < 0n || length <= 0)
    throw new Error("Number must be non-negative and length must be positive");

  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[length - 1 - i] = Number(num & 0xffn); // Extract the last 8 bits
    num >>= 8n; // Shift right by 8 bits
  }

  if (num > 0n)
    throw new Error("Number is too large for the specified byte length");
  return bytes;
}


export async function getBridgeTokenInfo(bridgeProgram: Program<AmbSolBridge>, token: PublicKey) {
  const [bridge_token_pda, _] = getBridgeTokenAccounts(token, bridgeProgram.programId);
  return await bridgeProgram.account.tokenConfig.fetch(bridge_token_pda);
}

export async function getOrCreateUserATA(connection: Connection, user: Signer, token: PublicKey) {
  const account = await getOrCreateAssociatedTokenAccount(connection, user, token, user.publicKey, undefined, undefined, {commitment: 'confirmed'});
  return account.address;
}

export function getUserNoncePda(user: PublicKey, bridgeProgramId: PublicKey) {
  const [nonceAccount] = PublicKey.findProgramAddressSync([Buffer.from("nonce"), user.toBuffer()], bridgeProgramId);
  return nonceAccount;
}

export function getBridgeStateAccount(bridgeProgramId: PublicKey) {
  const [state_pda] = PublicKey.findProgramAddressSync([Buffer.from("global_state")], bridgeProgramId);
  return state_pda
}

export function getBridgeTokenAccounts(token: PublicKey, bridgeProgramId: PublicKey) {
  const [pda] = PublicKey.findProgramAddressSync([Buffer.from("token"), token.toBuffer()], bridgeProgramId)
  const ata = getAssociatedTokenAddressSync(token, pda, true);
  return [pda, ata]
}


export async function initializeToken(bridgeProgram: Program<AmbSolBridge>, admin: Keypair, tokenPublicKey: PublicKey, ambAddress: string, ambDecimals = 18, isSynthetic = false) {
  await bridgeProgram.methods.initializeToken([...hexToUint8Array(ambAddress)], ambDecimals, isSynthetic).accountsPartial({
    admin: admin.publicKey,
    mint: tokenPublicKey,
    bridgeTokenAccount: isSynthetic ? null : undefined  // empty value (null) for synthetic, auto-resoluted for non-synthetic
  }).signers([admin]).rpc();
}



export enum Flags {
  SHOULD_UNWRAP = 1
}

export function checkFlags(flags: Uint8Array, flag: Flags) {
  return getBit(flags, flag) === 1;
}

function getBit(arr: Uint8Array, bitIndex: number): number {
  const byteIndex = Math.floor(bitIndex / 8);
  const bitPosition = bitIndex % 8;
  return (arr[byteIndex] >> bitPosition) & 1;
}
