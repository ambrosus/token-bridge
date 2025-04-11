export const BridgeFlags = {
  // Send flags 0-64 (65 bits)
  SENDER_IS_TXORIGIN: 1n << 0n,
  SEND_WITH_PERMIT: 1n << 1n,
  SHOULD_WRAP: 1n << 2n,
  // Receive flags 65-128 (63 bits)
  SHOULD_UNWRAP: 1n << 65n,
  SEND_NATIVE_TO_RECEIVER: 1n << 66n,
  SHOULD_RESTAKE: 1n << 67n,
}

// ENUM trick
export type BridgeFlags = typeof BridgeFlags[keyof typeof BridgeFlags];