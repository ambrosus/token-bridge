/*
 *  Copyright: Ambrosus Inc.
 *  Email: tech@ambrosus.io
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 *  This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
 */

import { Dependency } from "hono-simple-di";
import { Hono } from "hono";
import { SendSignatureController } from "../controllers/send-signature.controller";
import { zValidator } from "@hono/zod-validator";
import { evmAddressValidatorSchema, sendSignatureQuerySchema } from "./utils";

const sendSignatureControllerDep = new Dependency(
  (c) => {
    return new SendSignatureController();
  }
);

export const sendSignatureRoutes = new Hono();

sendSignatureRoutes.get(
  "/",
  zValidator("query", sendSignatureQuerySchema),
  sendSignatureControllerDep.middleware("sendSignatureController"),
  async (c) => {
    try {
      const {
        networkFrom,
        networkTo,
        tokenAddress,
        amount,
        isMaxAmount,
        externalTokenAddress,
        flags,
        flagData
      } = c.req.query();
      const { sendSignatureController } = c.var;
      const data = await sendSignatureController.getSendSignature({
        networkFrom,
        externalTokenAddress,
        networkTo,
        tokenAddress,
        amount,
        isMaxAmount: Boolean(isMaxAmount),
        flags,
        flagData
      });
      return c.json(data, 200);
    } catch (error) {
      console.log(error);
      return c.json((error as Error), 400);
    }
  }
);


export default sendSignatureRoutes;
