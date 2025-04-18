import { z } from "zod";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import {
  evmAddressValidatorSchema,
  receiptIdValidatorSchema,
  svmAddressValidatorSchema,
  unsignedReceiptsResponseSchema,
  signatureRegex
} from "./utils";
import { Hono } from "hono";
import { type ContentfulStatusCode } from "hono/utils/http-status";
import { receiptControllerMiddleware } from "../../middleware/receiptController";

export const relayRoutes = new Hono();

/* The code `routes.get("/relay", async (c) => { ... })` is defining a route for handling GET requests
to the "/receipts" endpoint. When a GET request is made to this endpoint, the code inside the callback
function will be executed. */

relayRoutes.get(
  "/evm/unsigned/:address",
  describeRoute({
    hide: process.env.NODE_ENV === "production",
    description:
      "Get unsigned EVM receipts that need to be signed by given address",
    responses: {
      200: {
        description: "Returns unsigned EVM receipts with receipt metadata",
        content: {
          "application/json": {
            schema: resolver(unsignedReceiptsResponseSchema)
          }
        }
      },
      400: {
        description: "Returns error message",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string"
                }
              }
            }
          }
        }
      }
    }
  }),
  zValidator("param", evmAddressValidatorSchema),
  receiptControllerMiddleware.middleware("receiptController"),
  async (c) => {
    try {
      const pubkey = c.req.valid("param").address;
      const { receiptController } = c.var;
      const data = await receiptController.getUnsignedReceipts(pubkey, "evm");
      return c.json(data, 200);
    } catch (error) {
      console.log(error);
      return c.json({ message: (error as Error).message }, 400);
    }
  }
);

relayRoutes.get(
  "/svm/unsigned/:address",
  describeRoute({
    hide: process.env.NODE_ENV === "production",
    description:
      "Get unsigned Solana receipts that need to be signed by given address",
    responses: {
      200: {
        description: "Returns unsigned Solana receipts with receipt metadata",
        content: {
          "application/json": {
            schema: resolver(unsignedReceiptsResponseSchema)
          }
        }
      },
      400: {
        description: "Returns error message",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string"
                }
              }
            }
          }
        }
      }
    }
  }),
  zValidator("param", svmAddressValidatorSchema),
  receiptControllerMiddleware.middleware("receiptController"),
  async (c) => {
    try {
      const pubkey = c.req.valid("param").address;
      const { receiptController } = c.var;
      const data = await receiptController.getUnsignedReceipts(pubkey, "svm");
      return c.json(unsignedReceiptsResponseSchema.parse(data), 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: (error as Error).message }, 400);
    }
  }
);

relayRoutes.post(
  "/:receiptId",
  describeRoute({
    hide: process.env.NODE_ENV === "production",
    description: "Add signature to receipt",
    responses: {
      201: {
        description: "Returns receipt",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                signed: {
                  type: "boolean",
                },
              },
              example: { signed: true },
              description: "If receipt has been signed",
            },
          },
        },
      },
      404: {
        description: "Receipt not found",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Receipt not found",
                },
              },
            },
          },
        },
      },
      400: {
        description: "Returns error message",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
  }),
  zValidator("param", receiptIdValidatorSchema),
  zValidator(
    "json",
    z.object({
      signer: z.string().openapi({
        examples: [
          "0xe0b52EC5cE3e124ab5306ea42463bE85aeb5eDDd",
          "FMYR5BFh3JapZS1cfwYViiBMYJxFGwKdchnghBnBtxkk",
        ],
        description: "Signer address",
      }),
      signature: z
        .string()
        .regex(signatureRegex)
        .transform((val) => {
          const processed = String(val);
          if (processed.startsWith("0X") || processed.startsWith("0x")) {
            return `0x${processed.slice(2)}` as `0x${string}`;
          }
          return `0x${processed}` as `0x${string}`;
        })
        .openapi({
          description: "Signature of message",
        }),
    })
  ),
  receiptControllerMiddleware.middleware("receiptController"),
  async (c) => {
    try {
      const { receiptController } = c.var;
      const receiptId = c.req.valid("param").receiptId;
      const { signer, signature } = c.req.valid("json");
      const signed = await receiptController.addSignature(
        receiptId,
        signer,
        signature
      );
      return c.json({ signed }, 201);
    } catch (error) {
      let status: ContentfulStatusCode = 400;
      if ((error as Error).message === "Receipt not found") {
        status = 404;
      }
      console.log(error);
      return c.json({ message: (error as Error).message }, status);
    }
  }
);

export default relayRoutes;
