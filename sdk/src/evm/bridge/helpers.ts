import {
  toHex,
  Hex,
  encodePacked,
  keccak256,
  hashMessage,
  hexToBigInt,
} from "viem";
import { Address, Base58 } from "ox";
import { BridgeFlags } from "../constants";
import {
  type FullReceipt,
  type MiniReceipt,
  type SendPayloadEVM,
} from "../types/calls";
import { getTokensConfig, SendPayload } from "../../backend";
import { EVMChains, SOLANA_CHAIN_ID, SOLANA_DEV_CHAIN_ID } from "../../config";

/**
 * Converts an EVM address to a bytes32 hex string
 * @alias evmAddressToBytes32
 * @param {Address.Address} address The EVM address to convert
 * @returns {Hex} The bytes32 hex string
 * @throws Error if the address is invalid
 */
export function addressToBytes32(address: Address.Address): Hex {
  if (address.length !== 42) {
    throw new Error("Possibly invalid evm address");
  }
  return toHex(hexToBigInt(address, { size: 20 }), { size: 32 });
}
/**
 * Converts an EVM address to a bytes32 hex string
 * @alias addressToBytes32
 * @param {Address.Address} address The EVM address to convert
 * @returns {Hex} The bytes32 hex string
 * @throws Error if the address is invalid
 */
export const evmAddressToBytes32 = addressToBytes32;

export const evmAddressFromBytes32 = (address: Hex): Address.Address => {
  if (address.length !== 66) {
    throw new Error("Possibly invalid hex bytes32 address");
  }
  return Address.from("0x" + address.slice(-40), { checksum: true });
};

/**
 * Converts an Solana base58 address to a bytes32 hex string
 * @alias solanaAddressToBytes32
 * @param {string} address The EVM address to convert
 * @returns {Hex} The bytes32 hex string
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
 * @param {string} address The EVM address to convert
 * @returns {Hex} The bytes32 hex string
 * @throws Error if the address is invalid
 */
export const solanaAddressToBytes32 = base58AddressToBytes32;

export const solanaAddressFromBytes32 = (address: Hex): string => {
  if (address.length !== 66) {
    throw new Error("Possibly invalid hex bytes32 address");
  }
  return Base58.fromHex(address);
};

/**
 * Gathers all signatures for a claim into a single `Hex` string
 * @param {Array<Hex>} signatures The signatures to gather
 * @returns {Hex} The concatenated signatures
 */
export function gatherSignaturesForClaim(signatures: Array<Hex>): Hex {
  return signatures.reduce((acc, sig) => (acc + sig.slice(2)) as Hex, "0x");
}

/**
 * Converts a full receipt to a mini receipt
 * @param {FullReceipt} receipt The full receipt to convert
 * @returns {MiniReceipt} The mini receipt
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
 * @param {FullReceipt} receipt The full receipt to hash
 * @returns {Hex} The keccak256 hash of the receipt
 */
function fullReceipt2hash(receipt: FullReceipt): Hex {
  const mini = full2miniReceipt(receipt);
  return miniReceipt2hash(mini);
}

/**
 * Creates a keccak256 hash of a mini receipt
 * @param {MiniReceipt} receipt The mini receipt to hash
 * @returns {Hex} The keccak256 hash of the receipt
 */
function miniReceipt2hash(receipt: MiniReceipt): Hex {
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
    ],
  );
  const messageHash = keccak256(encoded);
  return messageHash;
}

/**
 * Creates a hash of a prefixed message of a receipt
 * It useful when you want to check if a receipt is already claimed by its hash
 * @param {FullReceipt | MiniReceipt} receipt The receipt to hash
 * @returns {Hex} The hash of the receipt
 */
export function hashReceipt(receipt: FullReceipt | MiniReceipt) {
  const digest =
    "from" in receipt ? fullReceipt2hash(receipt) : miniReceipt2hash(receipt);
  return hashMessage({ raw: digest });
}

/**
 * Converts an API payload to a call payload for EVM.
 *
 * This function transforms a SendPayload object, typically retrieved from an API,
 * into a SendPayloadEVM object which is suitable for use within the EVM context.
 *
 * @param {SendPayload} payload - The SendPayload object containing transaction details.
 * @returns {SendPayloadEVM} A SendPayloadEVM object with the corresponding transaction information.
 */

export function apiPayloadToCallPayload(payload: SendPayload): SendPayloadEVM {
  return {
    chainFrom: payload.chainFrom,
    chainTo: payload.chainTo,
    tokenAddress: payload.tokenAddressFrom as Hex,
    externalTokenAddress: payload.tokenAddressTo as Hex,
    amountToSend: payload.amountToSend,
    feeAmount: payload.feeAmount,
    timestamp: payload.timestamp,
    flags: payload.flags,
    flagData: payload.flagData as Hex,
  };
}

/**
 * Checks if a specific flag is set in the given flags.
 *
 * @param {bigint} flags - The flags to check against.
 * @param {BridgeFlags} flag - The flag to check for.
 * @returns {boolean} - Returns true if the flag is set, false otherwise.
 */
export function checkFlag(flags: bigint, flag: BridgeFlags): boolean {
  return (flags & flag) === flag;
}

/**
 * Combines multiple flags into a single bigint value.
 *
 * @param {...BridgeFlags} flags - The flags to combine.
 * @returns {bigint} - The combined flags as a bigint.
 */
export function combineFlagsArray(...flags: Array<BridgeFlags>): bigint {
  return flags.reduce((acc, flag) => acc | flag, 0n);
}

/**
 * Combines multiple flags into a single bigint value.
 *
 * @param {Object} params - The parameters for combining flags.
 * @param {boolean} [params.isSenderTxOrigin] - Whether the sender is the transaction origin.
 * @param {boolean} [params.sendWithPermit] - Whether to send with permit.
 * @param {boolean} [params.shouldWrap] - Whether to wrap the token.
 * @param {boolean} [params.shouldUnwrap] - Whether to unwrap the token.
 * @param {boolean} [params.sendNativeToReceiver] - Whether to send native tokens to the receiver.
 * @param {boolean} [params.shouldRestake] - Whether to restake the tokens.
 * @returns {bigint} - The combined flags as a bigint.
 * @throws Error if an invalid flag is provided.
 */
export function combineFlags({
  isSenderTxOrigin,
  sendWithPermit,
  shouldWrap,
  shouldUnwrap,
  sendNativeToReceiver,
  shouldRestake,
}: {
  isSenderTxOrigin?: boolean;
  sendWithPermit?: boolean;
  shouldWrap?: boolean;
  shouldUnwrap?: boolean;
  sendNativeToReceiver?: boolean;
  shouldRestake?: boolean;
}): bigint {
  const flagsArray = [];
  if (isSenderTxOrigin) {
    flagsArray.push(BridgeFlags.SENDER_IS_TXORIGIN);
  }
  if (sendWithPermit) {
    flagsArray.push(BridgeFlags.SEND_WITH_PERMIT);
  }
  if (shouldWrap) {
    flagsArray.push(BridgeFlags.SHOULD_WRAP);
  }
  if (shouldUnwrap) {
    flagsArray.push(BridgeFlags.SHOULD_UNWRAP);
  }
  if (sendNativeToReceiver) {
    flagsArray.push(BridgeFlags.SEND_NATIVE_TO_RECEIVER);
  }
  if (shouldRestake) {
    flagsArray.push(BridgeFlags.SHOULD_RESTAKE);
  }
  return combineFlagsArray(...flagsArray);
}

async function getTokenWrappedData(tokenAddress: string, chainId: bigint) {
  const config = await getTokensConfig();
  const tokenConfig = Object.values(config.tokens).find((token) =>
    Object.values(token.addresses).find((address) => address === tokenAddress),
  );
  if (!tokenConfig) {
    throw new Error("Token not found in config");
  }
  let chainKey;
  switch (chainId) {
    case SOLANA_CHAIN_ID:
      chainKey = "sol";
      break;
    case SOLANA_DEV_CHAIN_ID:
      chainKey = "sol-dev";
      break;
    default:
      chainKey = Object.entries(EVMChains).find(
        ([, id]) => BigInt(id) === chainId,
      )?.[0];
      break;
  }
  if (!chainKey) {
    throw new Error("Chain not found in config");
  }
  const isWrapped = tokenConfig.nativeAnalog !== "";
  // Check if the token is in the primary networks for the given chain
  const chainInPrimaryNets = tokenConfig.primaryNets.includes(chainKey)
  return isWrapped && chainInPrimaryNets;
}

/**
 * Checks if a token is wrapped on the given chain
 * @param {Hex} tokenAddressB32 - The token address in bytes32 hex format
 * @param {bigint} chainId - The chain ID as a bigint
 * @returns {Promise<boolean>} True if the token is wrapped, false otherwise
 * @throws Error if the token is not found in the config
 * @throws Error if the chain identifier is not found in the config
 */
export async function wrappedStatus(
  tokenAddressB32: Hex,
  chainId: bigint,
): Promise<boolean> {
  // Parse the token address to needed format
  const isSol = chainId === SOLANA_CHAIN_ID || chainId === SOLANA_DEV_CHAIN_ID;
  const aEx = isSol ? solanaAddressFromBytes32 : evmAddressFromBytes32;
  const tokenAddress = aEx(tokenAddressB32);
  // Check if the token is wrapped on the given chain
  return await getTokenWrappedData(tokenAddress, chainId);
}
