import { Base58, Hex } from 'ox';

export function toHexFromBytes(byteArray: Uint8Array): string {
  return `0x${Buffer.from(padTo32Bytes(byteArray)).toString("hex")}`;
}

export function safeNumberToString(value: any): string {
  return value?.toString() || "0";
}

export function safeNumber(value: any): number {
  return Number(value?.toString()) || 0;
}

export function safeBigIntFromBuffer(value: Uint8Array): bigint {
  return BigInt(`0x${Buffer.from(value).toString("hex")}`) || 0n;
}

export function safeBigIntFromHex(value: any): bigint {
  return BigInt(`0x${value.toString("hex")}`) || 0n;
}

export function safeHexToNumber(byteArray: Uint8Array): number {
  return parseInt(Buffer.from(byteArray).toString("hex"), 16) || 0;
}

export function safeHexToString(byteArray: Uint8Array): string {
  if (!byteArray || byteArray.length === 0) {
    return "";
  }
  return "0x" + Buffer.from(byteArray).toString("hex");
}

export function padTo32Bytes(byteArray: Uint8Array): Uint8Array {
  if (byteArray.length > 32) {
    throw new Error(`Size cannot exceed 32 bytes. Given size: ${byteArray.length} bytes.`);
  }
  return Uint8Array.from([...new Array(32 - byteArray.length).fill(0), ...byteArray]);
}

export function toHex(bs58String: string): string {
  return Hex.fromBytes(Base58.toBytes(bs58String));
}
