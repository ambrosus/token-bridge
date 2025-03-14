import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { receipt, signatures } from "../db/schema/core.schema";
import { receiptsMetaInIndexerEvm } from "../db/schema/evm.schema";
import { receiptsMetaInIndexerSolana } from "../db/schema/solana.schema";
import { eq, or, asc, desc, ne, and, notInArray, inArray } from "drizzle-orm";
import {
  toBytes,
  keccak256,
  recoverMessageAddress,
  http,
  webSocket,
  type WebSocketTransport,
  type HttpTransport,
  encodePacked,
} from "viem";
import { consoleLogger } from "../utils";
import { serializeReceivePayload, ReceivePayload } from "../utils/solana";
import {
  CHAIN_ID_TO_CHAIN_NAME,
  SOLANA_CHAIN_ID,
  SOLANA_DEV_CHAIN_ID,
  stageConfig,
} from "../../config";
import nacl from "tweetnacl";
import { Connection, PublicKey } from "@solana/web3.js";
import { TokenConfigSchema } from "../routes/utils";

export class ReceiptController {
  db: NodePgDatabase;
  RPCs: Record<
    `RPC_URL_${number}`,
    WebSocketTransport | HttpTransport | Connection
  >;

  constructor(dbUrl: string, RPCs: Record<`RPC_URL_${number}`, string>) {
    this.db = drizzle(dbUrl);
    this.RPCs = Object.fromEntries(
      Object.entries(RPCs).map(([key, value]) => {
        switch (key) {
          case `RPC_URL_${SOLANA_CHAIN_ID}`:
          case `RPC_URL_${SOLANA_DEV_CHAIN_ID}`:
            return [[key], new Connection(value, "confirmed")];
          default:
            return [
              [key],
              value.startsWith("ws") ? webSocket(value) : http(value),
            ];
        }
      })
    );
  }

  async getAllReceipts(
    limit: number = 50,
    offset: number = 0,
    ordering: "asc" | "desc" = "desc",
    userAddress?: string
  ): Promise<
    Array<{
      receipt: typeof receipt.$inferSelect;
      receiptMeta: Array<
        | typeof receiptsMetaInIndexerEvm.$inferSelect
        | typeof receiptsMetaInIndexerSolana.$inferSelect
      >;
    }>
  > {
    try {
      await this.db.refreshMaterializedView(receipt);
      let baseQuery;
      if (userAddress) {
        baseQuery = this.db
          .select()
          .from(receipt)
          .where(
            or(eq(receipt.to, userAddress), eq(receipt.from, userAddress))
          );
      } else {
        baseQuery = this.db.select().from(receipt);
      }

      const result = await baseQuery
        .orderBy(
          ordering === "asc" ? asc(receipt.timestamp) : desc(receipt.timestamp)
        )
        .limit(limit)
        .offset(offset);
      const metasEvm = await this.db
        .select({
          receiptId: receiptsMetaInIndexerEvm.receiptId,
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
          receipt: r,
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

  async getReceipt(receiptId: `${number}_${number}_${number}`): Promise<{
    receipt: typeof receipt.$inferSelect;
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
        .where(eq(receipt.receiptId, receiptId));

      return {
        receipt: result,
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
      receipts: typeof receipt.$inferSelect;
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
    return receipts;
  }

  async getBridgeAddress(
    chainFrom: string,
    chainTo: string
  ): Promise<string | undefined> {
    const data = await fetch(stageConfig.tokensConfigUrl).then((res) =>
      res.json()
    );
    const { bridges } = TokenConfigSchema.parse(data);
    const chainNameFrom = CHAIN_ID_TO_CHAIN_NAME[chainFrom.toString()];
    const chainNameTo = CHAIN_ID_TO_CHAIN_NAME[chainTo.toString()];
    switch (chainNameTo) {
      case "amb":
      case "amb-test":
      case "amb-dev":
        return bridges[chainNameFrom][chainNameTo];
      default:
        return bridges[chainNameTo].side;
    }
  }

  private async checkSignerEVM(
    receiptToSign: typeof receipt.$inferSelect,
    signer: `0x${string}`,
    signature: `0x${string}`
  ): Promise<`0x${string}`> {
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
    const signerRecovered = await recoverMessageAddress({
      message: { raw: messageHash },
      signature,
    });
    if (signerRecovered !== signer) {
      throw new Error("Invalid signature");
    }
    // TODO: Replace to check against config
    // if (
    //   BigInt(receiptToSign.chainTo) === SOLANA_CHAIN_ID ||
    //   BigInt(receiptToSign.chainTo) === SOLANA_DEV_CHAIN_ID
    // ) {
    //   throw new Error("Invalid chain ID");
    // }
    // const nodeURL = this.RPCs[`RPC_URL_${Number(receiptToSign.chainTo)}`];
    // if (!nodeURL) throw new Error("RPC node not found");
    // const client = createPublicClient({
    //   transport: nodeURL as WebSocketTransport | HttpTransport,
    // });
    // const bridgeAddress = await this.getBridgeAddress(
    //   receiptToSign.chainFrom,
    //   receiptToSign.chainTo
    // );
    // if (!bridgeAddress) throw new Error("Bridge address not found");
    // const validatorAddress = await client.readContract({
    //   abi: bridgeAbi,
    //   address: bridgeAddress as `0x${string}`,
    //   functionName: "validator",
    //   args: [],
    // });
    // const isValidator = await client.readContract({
    //   abi: validatorAbi,
    //   address: validatorAddress,
    //   functionName: "isValidator",
    //   args: [signer],
    // });
    // if (!isValidator) {
    //   throw Error("Signer is not a validator");
    // }
    return signer;
  }

  private async checkSignerSolana(
    receiptToSign: typeof receipt.$inferSelect,
    signer: string,
    signature: `0x${string}`
  ): Promise<string> {
    const value: ReceivePayload = ReceivePayload.parse({
      to: toBytes(receiptToSign.to, { size: 32 }),
      tokenAddressTo: toBytes(receiptToSign.tokenAddressTo, { size: 32 }),
      amountTo: BigInt(receiptToSign.amountTo),
      chainTo: BigInt(receiptToSign.chainTo),
      flags: toBytes(BigInt(receiptToSign.flags), { size: 32 }),
      flagData: toBytes(receiptToSign.data),
    });
    const payload = serializeReceivePayload(value);
    const signatureBytes = toBytes(signature);
    const isValid = nacl.sign.detached.verify(
      payload,
      signatureBytes,
      new PublicKey(signer).toBytes()
    );
    if (!isValid) {
      throw new Error("Invalid signature");
    }
    // TODO: Check if signer is a validator against config
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
    if (!receiptToSign) {
      throw new Error("Receipt not found");
    }
    if (receiptToSign.claimed) {
      throw new Error("Receipt already claimed");
    }
    let signedBy: string;
    switch (BigInt(receiptToSign.chainTo)) {
      case SOLANA_CHAIN_ID:
      case SOLANA_DEV_CHAIN_ID:
        signedBy = await this.checkSignerSolana(
          receiptToSign,
          signer,
          signature
        );
        await this.db.insert(signatures).values({
          receiptId,
          signedBy,
          signature,
        });
        return true;
      default:
        signedBy = await this.checkSignerEVM(
          receiptToSign,
          signer as `0x${string}`,
          signature
        );
        await this.db.insert(signatures).values({
          receiptId,
          signedBy,
          signature,
        });
        return true;
    }
  }
}
