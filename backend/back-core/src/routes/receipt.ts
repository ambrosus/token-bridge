import { z } from "zod";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { ReceiptController } from "../controllers/receipt.controller";
import {
  evmAddressBytes32Hex,
  receiptIdValidatorSchema,
  receiptResponseSchema,
  signaturesResponseSchema,
  svmAddressBytes32Hex,
} from "./utils";
import { Hono } from "hono";
import { receiptControllerMiddleware } from "../../middleware/receiptController";
import { SOLANA_CHAIN_ID, SOLANA_DEV_CHAIN_ID } from "../../config";

export const receiptRoutes = new Hono<{
  Bindings: {
    SIGNATURES_REQUIRED: number;
    DATABASE_URL: string;
  };
}>();

/* The code `routes.get("/receipts", async (c) => { ... })` is defining a route for handling GET requests
to the "/receipts" endpoint. When a GET request is made to this endpoint, the code inside the callback
function will be executed. */

async function getReceipts(
  receiptController: ReceiptController,
  limit: number,
  offset: number,
  ordering: "asc" | "desc",
  userAddress: string | undefined = undefined
) {
  const data = await receiptController.getAllReceipts(
    limit,
    offset,
    ordering,
    userAddress
  );
  return z.array(receiptResponseSchema).parse(data);
}

receiptRoutes.get(
  "/",
  describeRoute({
    description: "Get all receipts",
    responses: {
      200: {
        description: "Returns receipts",
        content: {
          "application/json": {
            schema: resolver(z.array(receiptResponseSchema)),
          },
        },
      },
      400: {
        // 400 Bad Request
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
  zValidator(
    "query",
    z.object({
      limit: z.coerce.number().optional().default(50),
      offset: z.coerce.number().optional().default(0),
      ordering: z.enum(["asc", "desc"]).optional().default("desc"),
    })
  ),
  receiptControllerMiddleware.middleware("receiptController"),
  async (c) => {
    const { limit, offset, ordering } = c.req.valid("query");
    const { receiptController } = c.var;
    try {
      const data = await getReceipts(
        receiptController,
        limit,
        offset,
        ordering
      );
      return c.json(data, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: (error as Error).message }, 400);
    }
  }
);

receiptRoutes.get(
  "/user/:userAddress?",
  describeRoute({
    description: "Get all receipts for a user",
    responses: {
      200: {
        description: "Returns receipts",
        content: {
          "application/json": {
            schema: resolver(z.array(receiptResponseSchema)),
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
  zValidator(
    "param",
    z.object({
      userAddress: z
        .union([evmAddressBytes32Hex, svmAddressBytes32Hex])
        .optional(),
    })
  ),
  zValidator(
    "query",
    z.object({
      limit: z.coerce.number().optional().default(50),
      offset: z.coerce.number().optional().default(0),
      ordering: z.enum(["asc", "desc"]).optional().default("desc"),
    })
  ),
  receiptControllerMiddleware.middleware("receiptController"),
  async (c) => {
    const { userAddress } = c.req.valid("param");
    const { limit, offset, ordering } = c.req.valid("query");
    const { receiptController } = c.var;
    try {
      const data = await getReceipts(
        receiptController,
        limit,
        offset,
        ordering,
        userAddress
      );
      return c.json(data, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: (error as Error).message }, 400);
    }
  }
);

receiptRoutes.get(
  "/transaction/:transactionHash",
  describeRoute({
    description: "Get receiptId by transactionHash",
    responses: {
      200: {
        description: "Returns receiptId",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                receiptId: {
                  type: "string",
                },
              },
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
  zValidator(
    "param",
    z.object({
      transactionHash: z.string(),
    })
  ),
  receiptControllerMiddleware.middleware("receiptController"),
  async (c) => {
    const { transactionHash } = c.req.valid("param");
    const { receiptController } = c.var;
    try {
      const receiptId = await receiptController.getReceiptIdByTransactionHash(
        transactionHash
      );
      if (!receiptId) {
        return c.json({ message: "Receipt not found" }, 404);
      }
      return c.json({ receiptId }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ message: (error as Error).message }, 400);
    }
  }
);

receiptRoutes.get(
  "/:receiptId",
  describeRoute({
    description: "Get receipt by id",
    responses: {
      200: {
        description: "Returns receipt",
        content: {
          "application/json": {
            schema: resolver(receiptResponseSchema),
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
  receiptControllerMiddleware.middleware("receiptController"),
  async (c) => {
    try {
      const receiptId = c.req.valid("param").receiptId;
      const { receiptController } = c.var;
      const data = await receiptController.getReceipt(receiptId);
      if (!data || !data.receipt) {
        return c.json({ message: "Receipt not found" }, 404);
      }
      return c.json(receiptResponseSchema.parse(data), 200);
    } catch (error) {
      console.log(error);
      return c.json({ message: (error as Error).message }, 400);
    }
  }
);

receiptRoutes.get(
  "/signatures/:receiptId",
  describeRoute({
    description: "Get receipt signatures by id",
    responses: {
      200: {
        description: "Returns receipt",
        content: {
          "application/json": {
            schema: resolver(signaturesResponseSchema),
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
  receiptControllerMiddleware.middleware("receiptController"),
  async (c) => {
    try {
      const receiptId = c.req.valid("param").receiptId;
      const { receiptController } = c.var;

      const data = await receiptController.getReceiptSignatures(receiptId);
      const receipt = await receiptController.getReceipt(receiptId);
      return c.json(
        signaturesResponseSchema.parse({
          receiptId,
          readyForClaim: data.length >= c.env.SIGNATURES_REQUIRED,
          messageHash: [SOLANA_CHAIN_ID, SOLANA_DEV_CHAIN_ID].includes(
            BigInt(receipt.receipt.chainTo)
          )
            ? receiptController.hashedMsgSolana(receipt.receipt)
            : receiptController.hashedMsgEVM(receipt.receipt),
          signatures: data,
        }),
        200
      );
    } catch (error) {
      console.log(error);
      return c.json({ message: (error as Error).message }, 400);
    }
  }
);

export default receiptRoutes;
