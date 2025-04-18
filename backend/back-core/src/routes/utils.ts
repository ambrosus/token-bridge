import { z } from "zod";
import "zod-openapi/extend";
import { receipt, signatures } from "../db/schema/core.schema";
import { receiptsMetaInIndexerEvm } from "../db/schema/evm.schema";
import { receiptsMetaInIndexerSolana } from "../db/schema/solana.schema";
import { createSelectSchema } from "drizzle-zod";
import { Base58 } from "ox";
import { SOLANA_DEV_CHAIN_ID } from "../../config";
import { toHex } from "viem";
import type { Context } from "hono";
import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: (origin: string, c: Context) => {
    return c.env.ALLOWED_ORIGINS ? c.env.ALLOWED_ORIGINS.split(",") : "*";
  },
  allowMethods: ["GET", "POST"],
  allowHeaders: ["Content-Type"],
});

export const EvmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
export const SvmAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
export const signatureRegex = /^(0x|0X)?[a-fA-F0-9]{128,130}$/;
export const receiptIdRegex = /^[0-9]+_[0-9]+_[0-9]+$/;

export const evmAddressBytes32Hex = z
  .string()
  .regex(EvmAddressRegex)
  .transform((val) => {
    const processed = String(val);
    return `0x${processed.slice(2).padStart(64, "0")}` as `0x${string}`;
  })
  .openapi({
    type: "string",
    description: "EVM address in bytes32 hex format",
    example: "0xC6542eF81b2EE80f0bAc1AbEF6d920C92A590Ec7",
  });

export const svmAddressBytes32Hex = z
  .string()
  .regex(SvmAddressRegex)
  .transform((val, ctx) => {
    const processed = String(val);
    const hexAddress = toHex(Base58.toBytes(processed));
    if (hexAddress.length !== 64 + 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Not a valid Solana address",
      });
      // This is a special symbol you can use to
      // return early from the transform function.
      // It has type `never` so it does not affect the
      // inferred return type.
      return z.NEVER;
    }
    return hexAddress as `0x${string}`;
  })
  .openapi({
    type: "string",
    description: "Solana base58 address",
    example: "FMYR5BFh3JapZS1cfwYViiBMYJxFGwKdchnghBnBtxkk",
  });

export const signRequestValidatorSchema = z.object({
  signature: z
    .string()
    .regex(signatureRegex)
    .transform((val) => {
      const processed = String(val);
      if (processed.startsWith("0X") || processed.startsWith("0x")) {
        return processed.slice(2);
      }
      return `0x${processed}` as `0x${string}`;
    }),
});

export const evmAddressValidatorSchema = z.object({
  address: z.string().regex(EvmAddressRegex).openapi({
    type: "string",
    description: "EVM address",
    example: "0xe0b52EC5cE3e124ab5306ea42463bE85aeb5eDDd",
  }),
});

export const svmAddressValidatorSchema = z.object({
  address: z.string().regex(SvmAddressRegex).openapi({
    type: "string",
    description: "Solana base58 address",
    example: "FMYR5BFh3JapZS1cfwYViiBMYJxFGwKdchnghBnBtxkk",
  }),
});

export const receiptIdValidatorSchema = z.object({
  receiptId: z
    .string()
    .regex(receiptIdRegex)
    .transform((val) => val as `${number}_${number}_${number}`)
    .openapi({
      type: "string",
      description: "Receipt ID as 'chainFrom_chainTo_receiptId'",
      example: "1_22040_3",
    }),
});

export const payloadValidatorSchema = z.object({
  tokenAddress: z.string().regex(/^(0x)?[a-fA-F0-9]{64}$/),
  amount: z.coerce.bigint(),
  flags: z.coerce.bigint(),
  flagData: z
    .string()
    .regex(/^(0x|0X)?[a-fA-F0-9]+$/)
    .transform((val) => {
      const processed = String(val);
      if (processed.startsWith("0X") || processed.startsWith("0x")) {
        return processed.slice(2);
      }
      return `0x${processed}` as `0x${string}`;
    })
    .optional(),
});

export const payloadEvmValidatorSchema = payloadValidatorSchema.extend({
  tokenAddress: evmAddressBytes32Hex,
});

export const payloadSvmValidatorSchema = payloadValidatorSchema.extend({
  tokenAddress: svmAddressBytes32Hex,
});

export const sendSignatureQuerySchema = z.object({
  networkFrom: z.coerce.bigint().min(1n, "networkFrom is required").openapi({
    example: 1n,
    description: "Chain ID of the sender",
  }),
  networkTo: z.coerce.bigint().min(1n, "networkTo is required").openapi({
    example: SOLANA_DEV_CHAIN_ID,
    description: "Chain ID of the receiver",
  }),
  tokenAddress: z
    .string()
    .regex(/^(0x)?[a-fA-F0-9]{64}$/, "Invalid token address")
    .openapi({
      example:
        "0x000000000000000000000000C6542eF81b2EE80f0bAc1AbEF6d920C92A590Ec7",
      description: "Token address in bytes32 hex format",
    }),
  amount: z.coerce.bigint().positive().min(1n, "amount is required").openapi({
    example: 1000000000000000000n,
    description: "Amount of tokens to send",
  }),
  isMaxAmount: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .default("false")
    .openapi({
      example: false,
      description:
        "Whether to send the maximum amount of tokens (only for native tokens)",
    }),
  externalTokenAddress: z
    .string()
    .regex(/^(0x)?[a-fA-F0-9]{64}$/, "Invalid external token address")
    .openapi({
      example:
        "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
      description: "External token address in bytes32 hex format",
    }),
  flags: z.coerce.bigint().nonnegative().default(0n).openapi({
    example: 0n,
    description: "Flags for the transaction",
  }),
  flagData: z.string().default("0x").openapi({
    example: "0x",
    description: "Data for the flags",
  }),
});

// @ts-ignore
const ReceiptSchema = createSelectSchema(receipt, {
  receiptId: (schema: z.ZodString) =>
    schema.regex(receiptIdRegex).openapi({
      example: "6003100671677646000_22040_3",
      description: "Receipt ID as 'chainFrom_chainTo_eventId'",
    }),
  timestamp: (schema: z.ZodSchema) =>
    schema
      .transform((val) => BigInt(val))
      .pipe(z.bigint())
      .openapi({
        example: "1633632000",
        description: "Timestamp of the transaction",
      }),
  bridgeAddress: z
    .union([
      z.string().regex(EvmAddressRegex),
      z.string().regex(SvmAddressRegex),
    ])
    .openapi({
      examples: [
        "0xe0b52EC5cE3e124ab5306ea42463bE85aeb5eDDd",
        "FMYR5BFh3JapZS1cfwYViiBMYJxFGwKdchnghBnBtxkk",
      ],
      description: "Bridge address",
    }),
  from: (schema: z.ZodString) =>
    schema
      .regex(/^0x[a-fA-F0-9]{64}$/)
      .min(66)
      .max(66)
      .openapi({
        examples: [
          "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
        ],
        description: "Sender address",
      }),
  to: (schema: z.ZodString) =>
    schema
      .regex(/^0x[a-fA-F0-9]{64}$/)
      .min(66)
      .max(66)
      .openapi({
        examples: [
          "0x000000000000000000000000C6542eF81b2EE80f0bAc1AbEF6d920C92A590Ec7",
        ],
        description: "Receiver address",
      }),
  tokenAddressFrom: (schema: z.ZodString) =>
    schema
      .regex(/^0x[a-fA-F0-9]{64}$/)
      .min(66)
      .max(66)
      .openapi({
        examples: [
          "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
          "0x000000000000000000000000C6542eF81b2EE80f0bAc1AbEF6d920C92A590Ec7",
        ],
        description: "Token address on the sender chain",
      }),
  tokenAddressTo: (schema: z.ZodString) =>
    schema
      .regex(/^0x[a-fA-F0-9]{64}$/)
      .min(66)
      .max(66)
      .openapi({
        examples: [
          "0x000000000000000000000000C6542eF81b2EE80f0bAc1AbEF6d920C92A590Ec7",
          "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
        ],
        description: "Token address on the receiver chain",
      }),
  amountFrom: (schema: z.ZodSchema) =>
    schema
      .transform((val) => BigInt(val))
      .pipe(z.bigint())
      .openapi({
        example: "1000000000000000000",
        description: "Amount of tokens on the sender chain",
      }),
  amountTo: (schema: z.ZodSchema) =>
    schema
      .transform((val) => BigInt(val))
      .pipe(z.bigint())
      .openapi({
        example: "1000000000000000000",
        description: "Amount of tokens on the receiver chain",
      }),
  chainFrom: (schema: z.ZodSchema) =>
    schema
      .transform((val) => BigInt(val))
      .pipe(z.bigint())
      .openapi({
        example: SOLANA_DEV_CHAIN_ID.toString(),
        description: "Chain ID of the sender",
      }),
  chainTo: (schema: z.ZodSchema) =>
    schema
      .transform((val) => BigInt(val))
      .pipe(z.bigint())
      .openapi({
        example: "22040",
        description: "Chain ID of the receiver",
      }),
  eventId: (schema: z.ZodSchema) =>
    schema
      .transform((val) => BigInt(val))
      .pipe(z.bigint())
      .openapi({
        example: "3",
        description: "Event ID",
      }),
  flags: (schema: z.ZodSchema) =>
    schema
      .transform((val) => BigInt(val))
      .pipe(z.bigint())
      .openapi({
        example: "0",
        description: "Flags for the transaction",
      }),
  data: (schema: z.ZodString) =>
    schema
      .transform((val) => (val === "" ? "0x" : val))
      .pipe(z.string())
      .openapi({
        example: "0x",
        description: "Data for the flags",
      }),
  claimed: (schema: z.ZodBoolean) =>
    schema.openapi({
      example: false,
      description: "If receipt has been claimed",
    }),
  signaturesCount: (schema: z.ZodSchema) =>
    schema
      .transform((val) => Number.parseInt(val))
      .pipe(z.number().nonnegative())
      .openapi({
        example: 0,
        description: "Number of signatures",
      }),
}).extend({
  signaturesRequired: z.number().openapi({
    example: 5,
    description: "Number of signatures required",
  }),
});

export const receiptMetaEvmSchema = createSelectSchema(
  receiptsMetaInIndexerEvm,
  {
    receiptId: (schema: z.ZodString) =>
      schema.regex(receiptIdRegex).openapi({
        example: "6003100671677646000_22040_3",
        description: "Receipt ID as 'chainFrom_chainTo_eventId'",
      }),
    eventChain: (schema: z.ZodSchema) =>
      schema.openapi({
        example: "22040",
        description: "Chain ID of the event",
      }),
    blockHash: (schema: z.ZodSchema) =>
      schema.openapi({
        example:
          "0x1c5d488013f993bc30b0fdd2a378fe157c634cb00fa2c47ee4f8a8d332450e30",
        description: "Block hash",
      }),
    blockNumber: (schema: z.ZodSchema) =>
      schema.openapi({
        example: "12345678",
        description: "Block number",
      }),
    timestamp: (schema: z.ZodSchema) =>
      schema.openapi({
        example: "1633632000",
        description: "Timestamp of the transaction",
      }),
    transactionHash: (schema: z.ZodSchema) =>
      schema.openapi({
        example:
          "0x48abbe56ad2eec690800f8cd79fa24908f430269a1931d30647b1c9daec19b1b",
        description: "Transaction hash",
      }),
    transactionIndex: (schema: z.ZodSchema) =>
      schema.openapi({
        example: 1,
        description: "Transaction index in the block",
      }),
  }
);

export const receiptMetaSolanaSchema = createSelectSchema(
  receiptsMetaInIndexerSolana,
  {
    receiptId: (schema: z.ZodString) =>
      schema.regex(receiptIdRegex).openapi({
        example: "6003100671677646000_22040_3",
        description: "Receipt ID as 'chainFrom_chainTo_eventId'",
      }),
    eventChain: (schema: z.ZodSchema) =>
      schema.openapi({
        example: "22040",
        description: "Chain ID of the event",
      }),
    blockHash: (schema: z.ZodSchema) =>
      schema.nullable().openapi({
        example: null,
        description: "Not appliable to solana",
      }),
    blockNumber: (schema: z.ZodSchema) =>
      schema.openapi({
        example: "12345678",
        description: "Block number (slot)",
      }),
    timestamp: (schema: z.ZodSchema) =>
      schema.openapi({
        example: "1633632000",
        description: "Timestamp of the transaction",
      }),
    transactionHash: (schema: z.ZodSchema) =>
      schema.openapi({
        example:
          "4HkfnhW93nGRiT3s9YnVnN4fS6masj5FJ99bsTb1AX13NNdaE1BkfVidQ4hTB41MUVcPShft4fRDnZgBBDwWzED5",
        description: "Transaction signature",
      }),
    transactionIndex: (schema: z.ZodNumber) =>
      schema.openapi({
        example: 1,
        description: "Transaction index in the block",
      }),
  }
);

export const ReceiptMetaSchema = z.union([
  receiptMetaEvmSchema,
  receiptMetaSolanaSchema,
]);

export const unsignedReceiptsResponseSchema = z.array(
  z.object({
    receipts: ReceiptSchema,
    receiptsMeta: ReceiptMetaSchema,
  })
);

const signaturesSchema = createSelectSchema(signatures, {
  receiptId: (schema: z.ZodString) =>
    schema.regex(receiptIdRegex).openapi({
      example: "6003100671677646000_22040_3",
      description: "Receipt ID as 'chainFrom_chainTo_eventId",
    }),
  signedBy: (schema: z.ZodString) =>
    schema.openapi({
      examples: [
        "GCSfaYKrPKirtS33JzVZbAZmbwyGenWTXx9Zf77qo882",
        "0x0659f7D44aE52AA209319de9Ea99Da2FebABfD81",
      ],
      description: "Address of the relayer",
    }),
  signature: (schema: z.ZodString) =>
    schema.regex(signatureRegex).openapi({
      example:
        "0x14610d481d0b786920d49cb6318a03ac781ae3a031b306932773c0aad66339547d271ec0c306f62f4e297a8a6cd4c05774863a24852b3fe9a499a355a5fe8fb11b",
      description: "Signature of the transaction",
    }),
}).omit({ id: true });

export const receiptResponseSchema = z.object({
  receipt: ReceiptSchema,
  receiptMeta: z.array(ReceiptMetaSchema),
});

export const signaturesResponseSchema = z.object({
  receiptId: z.string().regex(receiptIdRegex).openapi({
    example: "6003100671677646000_22040_3",
    description: "Receipt ID as 'chainFrom_chainTo_eventId",
  }),
  readyForClaim: z.boolean().openapi({
    example: true,
    description:
      "If the receipt is ready to be claimed and has enough signatures",
  }),
  messageHash: z
    .string()
    .regex(/^0x([a-fA-F0-9]{2})+$/)
    .openapi({
      example:
        "0x14610d481d0b786920d49cb6318a03ac781ae3a031b306932773c0aad66339547d271ec0c306f62f4e297a8a6cd4c05774863a24852b3fe9a499a355a5fe8fb11b",
      description: "Hashed receipt of the transaction",
    }),
  signatures: z.array(signaturesSchema).openapi({
    description: "Signatures of the transaction",
  }),
});

export const SendPayload = z.object({
  chainFrom: z.coerce.bigint().min(1n, "chainFrom is required").openapi({
    example: 22040n,
    description: "Chain ID of the sender",
  }),
  chainTo: z.coerce.bigint().min(1n, "chainTo is required").openapi({
    example: SOLANA_DEV_CHAIN_ID,
    description: "Chain ID of the receiver",
  }),
  tokenAddressFrom: z
    .string()
    .regex(/^(0x)?[a-fA-F0-9]{64}$/, "Invalid token address")
    .openapi({
      example:
        "0x000000000000000000000000C6542eF81b2EE80f0bAc1AbEF6d920C92A590Ec7",
      description: "Token address in bytes32 hex format",
    }),
  tokenAddressTo: z
    .string()
    .regex(/^(0x)?[a-fA-F0-9]{40,64}$/, "Invalid external token address")
    .openapi({
      example:
        "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
      description: "External token address in bytes32 hex format",
    }),
  amountToSend: z.coerce
    .bigint()
    .positive()
    .min(1n, "amount is required")
    .openapi({
      example: 1000000000000000000n,
      description: "Amount of tokens to send",
    }),
  feeAmount: z.coerce.bigint().positive().openapi({
    example: 10000000n,
    description: "Amount of fee needed to send the transaction",
  }),
  timestamp: z.coerce.number().openapi({
    example: 1633632000,
    description: "Timestamp of the transaction",
  }),
  flags: z.coerce.bigint().nonnegative().default(0n).openapi({
    example: 0n,
    description: "Flags for the transaction",
  }),
  flagData: z.string().default("0x").openapi({
    example: "0x",
    description: "Data for the flags as hex string",
  }),
});

export type SendPayload = z.infer<typeof SendPayload>;

export const sendPayloadResponseSchema = z.object({
  sendPayload: SendPayload,
  signedBy: z
    .string()
    .regex(
      new RegExp(
        "(" + EvmAddressRegex.source + ")|(" + SvmAddressRegex.source + ")"
      )
    )
    .openapi({
      type: "string",
      description: "Address of the relayer",
      examples: [
        "0xC6542eF81b2EE80f0bAc1AbEF6d920C92A590Ec7",
        "FMYR5BFh3JapZS1cfwYViiBMYJxFGwKdchnghBnBtxkk",
      ],
    }),
  signature: z.string().regex(signatureRegex).openapi({
    type: "string",
    description: "Signature of the transaction",
    example:
      "0x14610d481d0b786920d49cb6318a03ac781ae3a031b306932773c0aad66339547d271ec0c306f62f4e297a8a6cd4c05774863a24852b3fe9a499a355a5fe8fb11b",
  }),
});

export const TokenConfigSchema = z.object({
  bridges: z
    .record(
      z.string().describe("Source network chain ID").openapi({
        description: "Source network chain ID",
        example: "22040",
      }),
      z.record(
        z.string().describe("Destination network chain ID").openapi({
          description: "Destination network chain ID",
          example: "6003100671677645902",
        }),
        z
          .union([
            z.string().regex(EvmAddressRegex),
            z.string().regex(SvmAddressRegex),
          ])
          .describe(
            "Bridge address from source to destination network in source network"
          )
          .openapi({
            description:
              "Bridge address from source to destination network in source network",
            examples: [
              "0x5Bcb9233DfEbcec502C1aCce6fc94FefF8c037C3",
              "ambZMSUBvU8bLfxop5uupQd9tcafeJKea1KoyTv2yM1",
            ],
          })
      )
    )
    .openapi({
      description: "Bridges for different networks",
      example: {
        "22040": {
          "6003100671677645902": "0x5Bcb9233DfEbcec502C1aCce6fc94FefF8c037C3",
        },
        "6003100671677645902": {
          "22040": "ambZMSUBvU8bLfxop5uupQd9tcafeJKea1KoyTv2yM1",
        },
      },
    }),
  tokens: z
    .record(
      z
        .string()
        .describe("Token symbol")
        .openapi({
          description: "Token symbol",
          examples: ["USDC", "SAMB", "wSOL"],
        }),
      z.object({
        isActive: z.boolean().openapi({
          description: "If token is active for transfers",
          example: true,
        }),
        name: z.string().openapi({
          description: "Token name",
          examples: ["USD Coin", "Synthetic Amber", "Wrapped SOL"],
        }),
        symbol: z.string().openapi({
          description: "Token symbol",
          examples: ["USDC", "SAMB", "wSOL"],
        }),
        ticker: z.string().openapi({
          description: "Token ticker to get prices",
          examples: ["USDT", "AMB", "SOL"],
        }),
        logo: z.string().url().optional().openapi({
          description: "Token logo URL",
          example:
            "https://en.wikipedia.org/wiki/File:Solana_logo.png#/media/File:Solana_logo.png",
        }),
        networks: z
          .record(
            z
              .string()
              .describe("Chain ID")
              .openapi({
                description: "Chain ID",
                examples: ["22040", "6003100671677645902"],
              }),
            z.object({
              address: z
                .union([
                  z.string().regex(EvmAddressRegex),
                  z.string().regex(SvmAddressRegex),
                ])
                .openapi({
                  description: "Token address",
                  examples: [
                    "0xB547f613B72928d4F62BCAc6Cc0d28C721f8D6bF",
                    "usdc3xpQ18NLAumSUvadS62srrkxQWrvQHugk8Nv7MA",
                  ],
                }),
              denomination: z
                .number()
                .nonnegative()
                .openapi({
                  description: "Token denomination (decimals)",
                  examples: [18, 6],
                }),
              isPrimary: z.boolean().openapi({
                description: "If token is primary on this network",
                examples: [false, true],
              }),
              nativeCoin: z
                .string()
                .optional()
                .openapi({
                  description: "Native coin symbol",
                  examples: ["AMB", "SOL"],
                }),
            })
          )
          .openapi({
            description: "Token data on different networks",
            examples: [
              {
                "22040": {
                  address: "0x2Cf845b49e1c4E5D657fbBF36E97B7B5B7B7b74b",
                  denomination: 18,
                  isPrimary: true,
                  nativeCoin: "AMB",
                },
                "6003100671677645902": {
                  address: "samb9vCFCTEvoi3eWDErSCb5GvTq8Kgv6VKSqvt7pgi",
                  denomination: 6,
                  isPrimary: false,
                },
              },
              {
                "22040": {
                  address: "0xB547f613B72928d4F62BCAc6Cc0d28C721f8D6bF",
                  denomination: 18,
                  isPrimary: false,
                },
                "6003100671677645902": {
                  address: "usdc3xpQ18NLAumSUvadS62srrkxQWrvQHugk8Nv7MA",
                  denomination: 6,
                  isPrimary: true,
                },
              },
            ],
          }),
      })
    )
    .openapi({
      description: "Tokens configuration for different networks",
      example: {
        SAMB: {
          isActive: true,
          name: "Synthetic Amber",
          symbol: "SAMB",
          ticker: "AMB",
          logo: "https://media-exp1.licdn.com/dms/image/C560BAQFuR2Fncbgbtg/company-logo_200_200/0/1636390910839?e=2159024400&v=beta&t=W0WA5w02tIEH859mVypmzB_FPn29tS5JqTEYr4EYvps",
          networks: {
            "22040": {
              address: "0x2Cf845b49e1c4E5D657fbBF36E97B7B5B7B7b74b",
              denomination: 18,
              isPrimary: true,
              nativeCoin: "AMB",
            },
            "6003100671677645902": {
              address: "samb9vCFCTEvoi3eWDErSCb5GvTq8Kgv6VKSqvt7pgi",
              denomination: 6,
              isPrimary: false,
            },
          },
        },
        USDC: {
          isActive: true,
          name: "USD Coin",
          symbol: "USDC",
          ticker: "USDT",
          logo: "https://etherscan.io/token/images/centre-usdc_28.png",
          networks: {
            "22040": {
              address: "0xB547f613B72928d4F62BCAc6Cc0d28C721f8D6bF",
              denomination: 18,
              isPrimary: false,
            },
            "6003100671677645902": {
              address: "usdc3xpQ18NLAumSUvadS62srrkxQWrvQHugk8Nv7MA",
              denomination: 6,
              isPrimary: true,
            },
          },
        },
        wSOL: {
          isActive: true,
          name: "Wrapped Solana",
          symbol: "wSOL",
          ticker: "SOL",
          logo: "https://en.wikipedia.org/wiki/File:Solana_logo.png#/media/File:Solana_logo.png",
          networks: {
            "22040": {
              address: "0x5B9E2BD997bc8f6aE97145cE0a8dEE075653f1AA",
              denomination: 18,
              isPrimary: false,
            },
            "6003100671677645902": {
              address: "So11111111111111111111111111111111111111112",
              denomination: 6,
              isPrimary: true,
              nativeCoin: "SOL",
            },
          },
        },
      },
    }),
});

export type TokenConfig = z.infer<typeof TokenConfigSchema>;
