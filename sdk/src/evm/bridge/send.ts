import { Address, Hex, PublicClient, WalletClient } from "viem";
import { getBridgeContract } from "./contract";
import { type SendPayloadEVM, type SendCall } from "../types/calls";
import { checkAllowanceERC20 } from "../token/checkAllowance";
import { checkBalanceNative } from "../native/balance";
import { handleCustomError } from "../utils/customErrors";

export async function sendFromEVM(
  sendParams: SendCall,
  bridgeAddress: Address,
  publicClient: PublicClient,
  walletClient: WalletClient
) {
  const bridgeContract = getBridgeContract(
    bridgeAddress,
    publicClient,
    walletClient
  );

  const enoughAllowance =
    !sendParams._deadline && !sendParams.v && !sendParams.r && !sendParams.s
      ? await checkAllowanceERC20(
          ("0x" + sendParams.payload.tokenAddress.slice(-40)) as Address,
          walletClient.account?.address!,
          bridgeAddress,
          sendParams.payload.amountToSend,
          publicClient
        )
      : true;
  const enoughNativeBalance = await checkBalanceNative(
    walletClient.account?.address!,
    sendParams.payload.feeAmount,
    publicClient
  );
  if (enoughAllowance && enoughNativeBalance) {
    try {
      const params: Array<Hex | SendPayloadEVM | bigint> = [
        sendParams.recipient,
        sendParams.payload,
        sendParams.payloadSignature,
      ];
      if (
        sendParams._deadline &&
        sendParams.v &&
        sendParams.r &&
        sendParams.s
      ) {
        params.push(
          sendParams._deadline,
          sendParams.v,
          sendParams.r,
          sendParams.s
        );
      }
      await bridgeContract.simulate.send(params, {
        value: sendParams.payload.feeAmount,
      });
      return await bridgeContract.write.send(params, {
        value: sendParams.payload.feeAmount,
      });
    } catch (err) {
      throw handleCustomError(err as Error);
    }
  }
}
