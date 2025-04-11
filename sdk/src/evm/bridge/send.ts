import {
  Address,
  Hex,
  PublicClient,
  WalletClient,
  WriteContractReturnType,
} from "viem";
import { getBridgeContract } from "./contract";
import {
  type SendPayloadEVM,
  type SendCall,
} from "../types/calls";
import { checkAllowanceERC20 } from "../token/checkAllowance";
import { checkBalanceNative } from "../native/balance";
import { handleCustomError } from "../utils/customErrors";
import { wrappedStatus, checkFlag } from "./helpers";
import { BridgeFlags } from "../constants";

/**
 * Send bridge transaction from the EVM chain contract
 * @param {SendCall} sendParams The parameters for the send transaction
 * @param {Address} bridgeAddress The address of the bridge contract
 * @param {PublicClient} publicClient The public client instance to use for the query transaction simulation and balance checks
 * @param {WalletClient} walletClient The wallet client instance to use for the send transaction
 * @returns {Promise<WriteContractReturnType>} The transaction hash
 * @throws Error if the transaction fails
 */
export async function sendFromEVM(
  sendParams: SendCall,
  bridgeAddress: Address,
  publicClient: PublicClient,
  walletClient: WalletClient,
): Promise<WriteContractReturnType> {
  const bridgeContract = getBridgeContract(
    bridgeAddress,
    publicClient,
    walletClient,
  );
  let value = sendParams.payload.feeAmount;
  // TODO: check if token can be wrapped on this chain
  if (checkFlag(sendParams.payload.flags, BridgeFlags.SHOULD_WRAP)) {
    if (
      !(await wrappedStatus(
        sendParams.payload.tokenAddress,
        sendParams.payload.chainFrom,
      ))
    ) {
      throw new Error("Token cannot be wrapped in source chain");
    }
    value += sendParams.payload.amountToSend;
  } else if (
    !sendParams._deadline &&
    !sendParams.v &&
    !sendParams.r &&
    !sendParams.s &&
    !checkFlag(sendParams.payload.flags, BridgeFlags.SEND_WITH_PERMIT)
  ) {
    await checkAllowanceERC20(
      ("0x" + sendParams.payload.tokenAddress.slice(-40)) as Address,
      walletClient.account?.address!,
      bridgeAddress,
      sendParams.payload.amountToSend,
      publicClient,
    );
  }
  await checkBalanceNative(walletClient.account?.address!, value, publicClient);
  if (checkFlag(sendParams.payload.flags, BridgeFlags.SHOULD_UNWRAP)) {
    if (
      !(await wrappedStatus(
        sendParams.payload.externalTokenAddress,
        sendParams.payload.chainTo,
      ))
    ) {
      throw new Error("Token cannot be unwrapped in destination chain");
    }
  }
  try {
    const params: Array<Hex | SendPayloadEVM | bigint> = [
      sendParams.recipient,
      sendParams.payload,
      sendParams.payloadSignature,
    ];
    if (
      checkFlag(sendParams.payload.flags, BridgeFlags.SEND_WITH_PERMIT) &&
      sendParams._deadline &&
      sendParams.v &&
      sendParams.r &&
      sendParams.s
    ) {
      params.push(
        sendParams._deadline,
        sendParams.v,
        sendParams.r,
        sendParams.s,
      );
    }
    await bridgeContract.simulate.send(params, { value });
    return await bridgeContract.write.send(params, { value });
  } catch (err) {
    throw handleCustomError(err as Error);
  }
}
