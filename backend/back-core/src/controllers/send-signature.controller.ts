/*
 *  Copyright: Ambrosus Inc.
 *  Email: tech@ambrosus.io
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 *  This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
 */
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import {
  bytesToHex,
  encodeAbiParameters,
  hashMessage,
  keccak256,
  toBytes,
  type PrivateKeyAccount,
} from "viem";
import { mnemonicToAccount, privateKeyToAccount } from "viem/accounts";

import { getFees } from "../fee";
import { SendPayloadEVM, SendPayloadSolana } from "../routes/utils";
import {
  CHAIN_ID_TO_CHAIN_NAME,
  SOLANA_CHAIN_ID,
  SOLANA_DEV_CHAIN_ID,
} from "../../config";
import {
  getSolanaAccount,
  serializeSendPayload,
  SendPayload as SolanaSendPayloadSerialize,
} from "../utils/solana";

interface SendSignatureArgs {
  networkFrom: bigint;
  networkTo: bigint;
  tokenAddress: string;
  externalTokenAddress: string;
  amount: bigint;
  isMaxAmount: boolean;
  flags: bigint;
  flagData: string;
}

export class SendSignatureController {
  solanaSigner: Keypair;
  evmSigner: PrivateKeyAccount;
  constructor(mnemonic: string) {
    const { secretKey: solanaPK } = getSolanaAccount(mnemonic);
    const emvPK =
      "0x" +
      Buffer.from(
        mnemonicToAccount(mnemonic, { addressIndex: 1 }).getHdKey().privateKey!
      ).toString("hex");
    this.solanaSigner = Keypair.fromSecretKey(solanaPK);
    this.evmSigner = privateKeyToAccount(emvPK as `0x${string}`);
  }

  async getSendSignature({
    networkFrom,
    networkTo,
    tokenAddress,
    amount,
    isMaxAmount,
    externalTokenAddress,
    flags,
    flagData,
  }: SendSignatureArgs) {
    if (
      !CHAIN_ID_TO_CHAIN_NAME[networkFrom.toString()] ||
      !CHAIN_ID_TO_CHAIN_NAME[networkTo.toString()]
    ) {
      throw new Error("Invalid network id");
    }
    const { feeAmount, amountToSend } = await getFees(
      CHAIN_ID_TO_CHAIN_NAME[networkFrom.toString()],
      CHAIN_ID_TO_CHAIN_NAME[networkTo.toString()],
      tokenAddress,
      amount,
      isMaxAmount
    );
    const timestamp = Math.floor(Date.now() / 1000);

    let signature, sendPayload: SendPayloadEVM | SendPayloadSolana;

    switch (networkFrom) {
      case SOLANA_CHAIN_ID:
      case SOLANA_DEV_CHAIN_ID:
        sendPayload = {
          tokenAddressFrom: bytesToHex(toBytes(tokenAddress, { size: 32 })),
          tokenAddressTo: bytesToHex(
            toBytes("0x" + externalTokenAddress.slice(-40), {
              size: 20,
            })
          ), // 0x + 20 bytes
          amountToSend: amountToSend,
          feeAmount: feeAmount,
          chainFrom: networkFrom,
          timestamp: timestamp,
          flags: flags,
          flagData: flagData
            ? bytesToHex(Buffer.from(flagData.slice(2), "hex"))
            : "",
        };
        signature = await this.signSvmSendPayload(sendPayload);
        break;
      default:
        sendPayload = {
          destChainId: networkTo,
          tokenAddress,
          externalTokenAddress,
          amountToSend,
          feeAmount,
          timestamp,
          flags,
          flagData,
        } as SendPayloadEVM;
        signature = await this.signEvmSendPayload(sendPayload);
        break;
    }
    return { sendPayload, signature };
  }

  async signEvmSendPayload(sendPayload: SendPayloadEVM) {
    const PayloadAbi = {
      name: "payload",
      type: "tuple",
      internalType: "struct BridgeTypes.SendPayload",
      components: [
        {
          name: "destChainId",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "tokenAddress",
          type: "bytes32",
          internalType: "bytes32",
        },
        {
          name: "externalTokenAddress",
          type: "bytes32",
          internalType: "bytes32",
        },
        {
          name: "amountToSend",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "feeAmount",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "timestamp",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "flags",
          type: "uint256",
          internalType: "uint256",
        },
        {
          name: "flagData",
          type: "bytes",
          internalType: "bytes",
        },
      ],
    };
    const payload = encodeAbiParameters<[typeof PayloadAbi]>(
      [PayloadAbi],
      [
        {
          destChainId: sendPayload.destChainId,
          tokenAddress: sendPayload.tokenAddress,
          externalTokenAddress: sendPayload.externalTokenAddress,
          amountToSend: sendPayload.amountToSend,
          feeAmount: sendPayload.feeAmount,
          timestamp: sendPayload.timestamp,
          flags: sendPayload.flags,
          flagData: sendPayload.flagData,
        },
      ]
    );
    const payloadHash = keccak256(payload);
    const digest = hashMessage({ raw: payloadHash });
    return await this.evmSigner.signMessage({ message: digest });
  }

  async signSvmSendPayload(sendPayload: SendPayloadSolana) {
    const sendPayloadToSerialize: SolanaSendPayloadSerialize =
      SolanaSendPayloadSerialize.parse({
        tokenAddressFrom: toBytes(sendPayload.tokenAddressFrom),
        tokenAddressTo: toBytes(sendPayload.tokenAddressTo),
        amountToSend: sendPayload.amountToSend,
        feeAmount: sendPayload.feeAmount,
        chainFrom: sendPayload.chainFrom,
        timestamp: BigInt(sendPayload.timestamp),
        flags: toBytes(sendPayload.flags, { size: 32 }),
        flagData:
          sendPayload.flagData === ""
            ? new Uint8Array(0)
            : toBytes(sendPayload.flagData),
      });
    const serializedPayload = serializeSendPayload(sendPayloadToSerialize);
    const signature = nacl.sign.detached(
      serializedPayload,
      this.solanaSigner.secretKey
    );
    return bytesToHex(signature);
  }
}
