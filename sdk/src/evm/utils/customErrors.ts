import {
  AbiErrorSignatureNotFoundError,
  BaseError,
  ContractFunctionRevertedError,
  decodeErrorResult,
  Hex,
  RpcRequestError,
} from "viem";
import { validatorAbi } from "../abi/validatorAbi";
import { bridgeAbi } from "../abi/bridgeAbi";
import { ERC20Abi } from "../abi/ERC20";

type CustomError = Error & {
  errorName: string;
  errorArgs: Array<any>;
};

export function handleCustomError(error: Error): CustomError {
  let processedError: CustomError | undefined = undefined;
  if (error instanceof BaseError) {
    const revertError = error.walk(
      (err) => err instanceof ContractFunctionRevertedError
    );
    const rpcError = error.walk((err) => err instanceof RpcRequestError);
    if (revertError instanceof ContractFunctionRevertedError) {
      if (revertError.data === undefined) {
        throw error;
      }
      const errorName = revertError.data.errorName ?? "";
      console.error(`Error: ${errorName}, args: ${revertError.data.args}`);
      processedError = {
        ...revertError,
        errorName,
        errorArgs: Array.from(revertError.data.args ?? []),
      };
    } else if (rpcError instanceof RpcRequestError) {
      if (rpcError.data === undefined) {
        processedError = {
          ...rpcError,
          errorName: "Unknown",
          errorArgs: [],
        };
      }
      const nonEmptyReason = (rpcError.data as string).includes("0x", 8);
      if (!nonEmptyReason) {
        processedError = {
          ...rpcError,
          errorName: "Unknown",
          errorArgs: [],
        };
      }
      const reason = (rpcError.data as `Reverted 0x${string}`).replace(
        "Reverted ",
        ""
      ) as Hex;
      for (const abi of [ERC20Abi, validatorAbi, bridgeAbi]) {
        try {
          const decoded = decodeErrorResult({
            data: reason as Hex,
            abi,
          });
          console.error(`Error: ${decoded.errorName}, args: ${decoded.args}`);
          processedError = {
            ...rpcError,
            errorName: decoded.errorName,
            errorArgs: Array.from(decoded.args ?? []),
          };
        } catch (decodeErr) {
          if (decodeErr instanceof AbiErrorSignatureNotFoundError) {
            continue;
          }
        }
      }
      if (processedError === undefined) {
        processedError = {
          ...rpcError,
          errorName: "Unknown",
          errorArgs: [],
        };
      }
    }
  }
  return (
    processedError ?? {
      ...error,
      errorName: "Unknown",
      errorArgs: [],
    }
  );
}
