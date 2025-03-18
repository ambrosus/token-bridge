import { bridgeAbi } from "./abi/bridgeAbi";
import { ERC20Abi } from "./abi/ERC20";
import { validatorAbi } from "./abi/validatorAbi";
export const abi = { bridgeAbi, ERC20Abi, validatorAbi };

import { getBridgeContract } from "./bridge/contract";
import * as helpersBridge from "./bridge/helpers";
import { checkBalanceNative } from "./native/balance";
import { checkAllowanceERC20 } from "./token/checkAllowance";
import { handleCustomError } from "./utils/customErrors";
export const helpers = {
  ...helpersBridge,
  getBridgeContract,
  checkBalanceNative,
  checkAllowanceERC20,
  handleCustomError,
};

import { checkIsClaimed, amountAdditionalNativeToSend } from "./bridge/views";
import { claimInEVM } from "./bridge/claim";
import { sendFromEVM } from "./bridge/send";
export const contract = {
  calls: {
    claimInEVM,
    sendFromEVM,
  },
  views: {
    checkIsClaimed,
    amountAdditionalNativeToSend,
  },
};

export type * from "./types";
