import {
  toHex,
  Address,
  Hex,
  encodePacked,
  keccak256,
  hashMessage,
  hexToBigInt,
} from "viem";
import { Base58 } from "ox";
import { FullReceipt, MiniReceipt } from "../types/calls";

/**
 * Converts an EVM address to a bytes32 hex string
 * @alias evmAddressToBytes32
 * @param address The EVM address to convert
 * @returns The bytes32 hex string
 * @throws Error if the address is invalid
 */
export function addressToBytes32(address: Address): Hex {
  if (address.length !== 42) {
    throw new Error("Possibly invalid evm address");
  }
  return toHex(hexToBigInt(address, { size: 20 }), { size: 32 });
}
/**
 * Converts an EVM address to a bytes32 hex string
 * @alias addressToBytes32
 * @param address The EVM address to convert
 * @returns The bytes32 hex string
 * @throws Error if the address is invalid
 */
export const evmAddressToBytes32 = addressToBytes32;

/**
 * Converts an Solana base58 address to a bytes32 hex string
 * @alias solanaAddressToBytes32
 * @param address The EVM address to convert
 * @returns The bytes32 hex string
 * @throws Error if the address is invalid
 */
export function base58AddressToBytes32(address: string): Hex {
  const hex = toHex(Base58.toBytes(address));
  if (hex.length !== 66) {
    throw new Error("Possibly invalid solana address");
  }
  return hex;
}

/**
 * Converts an Solana base58 address to a bytes32 hex string
 * @alias base58AddressToBytes32
 * @param address The EVM address to convert
 * @returns The bytes32 hex string
 * @throws Error if the address is invalid
 */
export const solanaAddressToBytes32 = base58AddressToBytes32;

/**
 * Gathers all signatures for a claim into a single `Hex` string
 * @param signatures The signatures to gather
 * @returns The concatenated signatures
 */
export function gatherSignaturesForClaim(signatures: Array<Hex>): Hex {
  return signatures.reduce((acc, sig) => (acc + sig.slice(2)) as Hex, "0x");
}

/**
 * Converts a full receipt to a mini receipt
 * @param receipt The full receipt to convert
 * @returns The mini receipt
 */
export function full2miniReceipt(receipt: FullReceipt): MiniReceipt {
  return {
    to: receipt.to,
    tokenAddressTo: receipt.tokenAddressTo,
    amountTo: receipt.amountTo,
    chainFrom: receipt.chainFrom,
    chainTo: receipt.chainTo,
    eventId: receipt.eventId,
    flags: receipt.flags,
    data: receipt.data,
  };
}

/**
 * Creates a keccak256 hash of a full receipt
 * @param receipt The full receipt to hash
 * @returns The keccak256 hash of the receipt
 */
function fullReceipt2hash(receipt: FullReceipt) {
  const mini = full2miniReceipt(receipt);
  return miniReceipt2hash(mini);
}

/**
 * Creates a keccak256 hash of a mini receipt
 * @param receipt The mini receipt to hash
 * @returns The keccak256 hash of the receipt
 */
function miniReceipt2hash(receipt: MiniReceipt) {
  const encoded = encodePacked(
    [
      "bytes32",
      "bytes32",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "bytes",
    ],
    [
      receipt.to,
      receipt.tokenAddressTo,
      receipt.amountTo,
      receipt.chainFrom,
      receipt.chainTo,
      receipt.eventId,
      receipt.flags,
      receipt.data,
    ]
  );
  const messageHash = keccak256(encoded);
  return messageHash;
}

/**
 * Creates a hash of a prefixed message of a receipt
 * It useful when you want to check if a receipt is already claimed by its hash
 * @param receipt The receipt to hash
 * @returns The hash of the receipt
*/
export function hashReceipt(receipt: FullReceipt | MiniReceipt) {
  const digest =
    "from" in receipt ? fullReceipt2hash(receipt) : miniReceipt2hash(receipt);
  return hashMessage({ raw: digest });
}
