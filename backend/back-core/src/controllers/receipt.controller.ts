import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { receipt, signatures } from "../db/schema/core.schema";
import { receiptsMetaInIndexerEvm } from "../db/schema/evm.schema";
import { receiptsMetaInIndexerSolana } from "../db/schema/solana.schema";
import { eq, or, asc, desc, ne, and, notInArray, inArray } from "drizzle-orm";
import { toBytes, keccak256, recoverMessageAddress, encodePacked, bytesToHex } from "viem";
import { consoleLogger } from "../utils";
import { serializeReceivePayload, ReceivePayload } from "../utils/solana";
import {
  bridgeValidators,
  SOLANA_CHAIN_ID,
  SOLANA_DEV_CHAIN_ID,
} from "../../config";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import { Networks } from "../utils/networks";
import { Hash } from "ox";

export class ReceiptController {
  db: NodePgDatabase;

  constructor(dbUrl: string) {
    this.db = drizzle(dbUrl);
  }

  async getAllReceipts(
    limit: number = 50,
    offset: number = 0,
    ordering: "asc" | "desc" = "desc",
    userAddress?: string,
    chainFrom?: number,
    chainTo?: number
  ): Promise<
    Array<{
      receipt: typeof receipt.$inferSelect & {
        signaturesRequired: number;
      };
      receiptMeta: Array<
        | typeof receiptsMetaInIndexerEvm.$inferSelect
        | typeof receiptsMetaInIndexerSolana.$inferSelect
      >;
    }>
  > {
    try {
      await this.db.refreshMaterializedView(receipt);
      const filterUser = userAddress
        ? or(eq(receipt.to, userAddress), eq(receipt.from, userAddress))
        : undefined;
      const filterChainFrom = chainFrom
        ? eq(receipt.chainFrom, chainFrom.toString())
        : inArray(receipt.chainFrom, Object.keys(bridgeValidators));
      const filterChainTo = chainTo
        ? eq(receipt.chainTo, chainTo.toString())
        : inArray(receipt.chainTo, Object.keys(bridgeValidators));

      const result = await this.db
        .select()
        .from(receipt)
        .where(and(filterUser, filterChainFrom, filterChainTo))
        .orderBy(
          ordering === "asc" ? asc(receipt.timestamp) : desc(receipt.timestamp)
        )
        .limit(limit)
        .offset(offset);
      const metasEvm = await this.db
        .select({
          receiptId: receiptsMetaInIndexerEvm.receiptId,
          eventChain: receiptsMetaInIndexerEvm.eventChain,
          blockHash: receiptsMetaInIndexerEvm.blockHash,
          blockNumber: receiptsMetaInIndexerEvm.blockNumber,
          timestamp: receiptsMetaInIndexerEvm.timestamp,
          transactionHash: receiptsMetaInIndexerEvm.transactionHash,
          transactionIndex: receiptsMetaInIndexerEvm.transactionIndex,
        })
        .from(receiptsMetaInIndexerEvm)
        .where(
          inArray(
            receiptsMetaInIndexerEvm.receiptId,
            result.map((r) => r.receiptId)
          )
        );
      const metasSolana = await this.db
        .select({
          receiptId: receiptsMetaInIndexerSolana.receiptId,
          eventChain: receiptsMetaInIndexerSolana.eventChain,
          blockHash: receiptsMetaInIndexerSolana.blockHash,
          blockNumber: receiptsMetaInIndexerSolana.blockNumber,
          timestamp: receiptsMetaInIndexerSolana.timestamp,
          transactionHash: receiptsMetaInIndexerSolana.transactionHash,
          transactionIndex: receiptsMetaInIndexerSolana.transactionIndex,
        })
        .from(receiptsMetaInIndexerSolana)
        .where(
          inArray(
            receiptsMetaInIndexerSolana.receiptId,
            result.map((r) => r.receiptId)
          )
        );
      return result.map((r) => {
        const metaEvm = metasEvm.filter((m) => m.receiptId === r.receiptId);
        const metaSolana = metasSolana.filter(
          (m) => m.receiptId === r.receiptId
        );
        return {
          receipt: {
            ...r,
            signaturesRequired: bridgeValidators[r.chainTo].length,
          },
          receiptMeta: [...metaEvm, ...metaSolana],
        };
      });
    } catch (error) {
      consoleLogger(
        "Error selecting receipts",
        (error as unknown as Error).toString()
      );
      consoleLogger((error as Error).stack as string);
      throw error as Error;
    }
  }

  async getReceiptIdByTransactionHash(
    transactionHash: string
  ): Promise<string | null> {
    try {
      const metaEvm = await this.db
        .select({ receiptId: receiptsMetaInIndexerEvm.receiptId })
        .from(receiptsMetaInIndexerEvm)
        .where(eq(receiptsMetaInIndexerEvm.transactionHash, transactionHash))
        .limit(1);

      if (metaEvm.length > 0) {
        return metaEvm[0].receiptId;
      }

      const metaSolana = await this.db
        .select({ receiptId: receiptsMetaInIndexerSolana.receiptId })
        .from(receiptsMetaInIndexerSolana)
        .where(eq(receiptsMetaInIndexerSolana.transactionHash, transactionHash))
        .limit(1);

      if (metaSolana.length > 0) {
        return metaSolana[0].receiptId;
      }
      return null;
    } catch (error) {
      consoleLogger(
        "Error retrieving receiptId by transactionHash",
        (error as unknown as Error).toString()
      );
      consoleLogger((error as Error).stack as string);
      throw error as Error;
    }
  }

  async getReceipt(receiptId: `${number}_${number}_${number}`): Promise<{
    receipt: typeof receipt.$inferSelect & {
      signaturesRequired: number;
    };
    receiptMeta: Array<
      | typeof receiptsMetaInIndexerEvm.$inferSelect
      | typeof receiptsMetaInIndexerSolana.$inferSelect
    >;
  }> {
    try {
      await this.db.refreshMaterializedView(receipt);
      const metaEvm = await this.db
        .select({
          receiptId: receiptsMetaInIndexerEvm.receiptId,
          eventChain: receiptsMetaInIndexerEvm.eventChain,
          blockHash: receiptsMetaInIndexerEvm.blockHash,
          blockNumber: receiptsMetaInIndexerEvm.blockNumber,
          timestamp: receiptsMetaInIndexerEvm.timestamp,
          transactionHash: receiptsMetaInIndexerEvm.transactionHash,
          transactionIndex: receiptsMetaInIndexerEvm.transactionIndex,
        })
        .from(receiptsMetaInIndexerEvm)
        .where(eq(receiptsMetaInIndexerEvm.receiptId, receiptId));
      const metaSolana = await this.db
        .select({
          receiptId: receiptsMetaInIndexerSolana.receiptId,
          eventChain: receiptsMetaInIndexerSolana.eventChain,
          blockHash: receiptsMetaInIndexerSolana.blockHash,
          blockNumber: receiptsMetaInIndexerSolana.blockNumber,
          timestamp: receiptsMetaInIndexerSolana.timestamp,
          transactionHash: receiptsMetaInIndexerSolana.transactionHash,
          transactionIndex: receiptsMetaInIndexerSolana.transactionIndex,
        })
        .from(receiptsMetaInIndexerSolana)
        .where(eq(receiptsMetaInIndexerSolana.receiptId, receiptId));
      const [result] = await this.db
        .select()
        .from(receipt)
        .where(
          and(
            eq(receipt.receiptId, receiptId),
            inArray(receipt.chainFrom, Object.keys(bridgeValidators)),
            inArray(receipt.chainTo, Object.keys(bridgeValidators))
          )
        );
      if (!Object.keys(bridgeValidators).includes(result.chainFrom))
        throw new Error("Receipt chainFrom not supported");
      if (!Object.keys(bridgeValidators).includes(result.chainTo))
        throw new Error("Receipt chainTo not supported");
      return {
        receipt: {
          ...result,
          signaturesRequired: bridgeValidators[result.chainTo].length,
        },
        receiptMeta: [...metaEvm, ...metaSolana],
      };
    } catch (error) {
      consoleLogger(
        "Error selecting receipt",
        (error as unknown as Error).toString()
      );
      consoleLogger((error as Error).stack as string);
      throw error as Error;
    }
  }

  async getReceiptSignatures(
    receiptId: `${number}_${number}_${number}`
  ): Promise<Array<Omit<typeof signatures.$inferSelect, "id">>> {
    try {
      await this.db.refreshMaterializedView(receipt);
      const signaturesData = await this.db
        .select({
          receiptId: signatures.receiptId,
          signedBy: signatures.signedBy,
          signature: signatures.signature,
        })
        .from(signatures)
        .where(eq(signatures.receiptId, receiptId))
        .orderBy(asc(signatures.signedBy));
      return signaturesData;
    } catch (error) {
      consoleLogger(
        "Error selecting receipt signatures",
        (error as unknown as Error).toString()
      );
      consoleLogger((error as Error).stack as string);
      throw error as Error;
    }
  }

  async getUnsignedReceipts(
    pubkey: string,
    chainEnum: "evm" | "svm"
  ): Promise<
    Array<{
      receipts: typeof receipt.$inferSelect & {
        signaturesRequired: number;
      };
      receiptsMeta:
        | typeof receiptsMetaInIndexerEvm.$inferSelect
        | typeof receiptsMetaInIndexerSolana.$inferSelect
        | null;
    }>
  > {
    await this.db.refreshMaterializedView(receipt);
    const joinModel =
      chainEnum === "svm"
        ? receiptsMetaInIndexerEvm
        : receiptsMetaInIndexerSolana;
    const receipts = await this.db
      .select()
      .from(receipt)
      .where(
        and(
          inArray(receipt.chainFrom, Object.keys(bridgeValidators)),
          inArray(receipt.chainTo, Object.keys(bridgeValidators)),
          eq(receipt.claimed, false),
          chainEnum === "svm"
            ? or(
                eq(receipt.chainTo, SOLANA_CHAIN_ID.toString()),
                eq(receipt.chainTo, SOLANA_DEV_CHAIN_ID.toString())
              )
            : and(
                ne(receipt.chainTo, SOLANA_CHAIN_ID.toString()),
                ne(receipt.chainTo, SOLANA_DEV_CHAIN_ID.toString())
              ),
          notInArray(
            receipt.receiptId,
            this.db
              .select({ receiptId: signatures.receiptId })
              .from(signatures)
              .where(eq(signatures.signedBy, pubkey))
          )
        )
      )
      .leftJoin(joinModel, eq(receipt.receiptId, joinModel.receiptId));
    return receipts.map((r) => ({
      receipts: {
        ...r.receipts,
        signaturesRequired: bridgeValidators[r.receipts.chainTo].length,
      },
      receiptsMeta: r.receiptsMeta,
    }));
  }

  hashedMsgEVM(
    receiptToSign: typeof receipt.$inferSelect
  ): `0x${string}` {
    const message = encodePacked(
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
        receiptToSign.to as `0x${string}`,
        receiptToSign.tokenAddressTo as `0x${string}`,
        BigInt(receiptToSign.amountTo),
        BigInt(receiptToSign.chainFrom),
        BigInt(receiptToSign.chainTo),
        BigInt(receiptToSign.eventId),
        BigInt(receiptToSign.flags),
        receiptToSign.data as `0x${string}`,
      ]
    );
    const messageHash = keccak256(message);
    return messageHash;
  }

  hashedMsgSolana(
    receiptToSign: typeof receipt.$inferSelect
  ): `0x${string}` {
    const value: ReceivePayload = ReceivePayload.parse({
      to: toBytes(receiptToSign.to, { size: 32 }),
      tokenAddressTo: toBytes(receiptToSign.tokenAddressTo, { size: 32 }),
      amountTo: BigInt(receiptToSign.amountTo),
      chainTo: BigInt(receiptToSign.chainTo),
      flags: toBytes(BigInt(receiptToSign.flags), { size: 32 }),
      flagData: toBytes(receiptToSign.data),
    });
    const payload = serializeReceivePayload(value);
    const messageHash = keccak256(payload);
    return messageHash;
  }

  private async checkSignerEVM(
    receiptToSign: typeof receipt.$inferSelect,
    signer: `0x${string}`,
    signature: `0x${string}`
  ): Promise<`0x${string}`> {
    const messageHash = this.hashedMsgEVM(receiptToSign);
    const signerRecovered = await recoverMessageAddress({
      message: { raw: messageHash },
      signature,
    });

    if (signerRecovered !== signer) throw new Error("Invalid signature");
    const validators = bridgeValidators[receiptToSign.chainTo];
    if (validators.length === 0) throw new Error("Validators not found");
    if (!validators.includes(signer)) throw Error("Signer is not a validator");
    return signer;
  }

  private async checkSignerSolana(
    receiptToSign: typeof receipt.$inferSelect,
    signer: string,
    signature: `0x${string}`
  ): Promise<string> {
    const messageHash = toBytes(this.hashedMsgSolana(receiptToSign));
    const signatureBytes = toBytes(signature);
    const isValid = nacl.sign.detached.verify(
      messageHash,
      signatureBytes,
      new PublicKey(signer).toBytes()
    );
    if (!isValid) throw new Error("Invalid signature");

    const validators = bridgeValidators[receiptToSign.chainTo];
    if (validators.length === 0) throw new Error("Validators not found");
    if (!validators.includes(signer)) throw Error("Signer is not a validator");

    return signer;
  }

  async addSignature(
    receiptId: `${number}_${number}_${number}`,
    signer: string,
    signature: `0x${string}`
  ): Promise<boolean> {
    await this.db.refreshMaterializedView(receipt);
    const [receiptToSign] = await this.db
      .select()
      .from(receipt)
      .where(eq(receipt.receiptId, receiptId));

    if (!receiptToSign) throw new Error("Receipt not found");
    if (receiptToSign.claimed) throw new Error("Receipt already claimed");

    let signedBy: string;
    if (Networks.isSolana(BigInt(receiptToSign.chainTo))) {
      signedBy = await this.checkSignerSolana(receiptToSign, signer, signature);
    } else {
      signedBy = await this.checkSignerEVM(
        receiptToSign,
        signer as `0x${string}`,
        signature
      );
    }

    await this.db.insert(signatures).values({ receiptId, signedBy, signature });
    return true;
  }
}
