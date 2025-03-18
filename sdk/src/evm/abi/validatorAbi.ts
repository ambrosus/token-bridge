import { type Abi } from "viem";

export const validatorAbi: Abi = [
  {
    type: "function",
    name: "addValidator",
    inputs: [
      {
        name: "validator_",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "added",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "authority",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "feeValidityWindow",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "authority_",
        type: "address",
        internalType: "address",
      },
      {
        name: "validators_",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "payloadSigner_",
        type: "address",
        internalType: "address",
      },
      {
        name: "feeValidityWindow_",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isConsumingScheduledOp",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isValidator",
    inputs: [
      {
        name: "validator_",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "isValidator_",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "payloadSigner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "removeValidator",
    inputs: [
      {
        name: "validator_",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "removed",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setAuthority",
    inputs: [
      {
        name: "newAuthority",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setFeeValidityWindow",
    inputs: [
      {
        name: "feeValidityWindow_",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "success",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPayloadSigner",
    inputs: [
      {
        name: "payloadSigner_",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "success",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "validate",
    inputs: [
      {
        name: "receipt",
        type: "tuple",
        internalType: "struct BridgeTypes.MiniReceipt",
        components: [
          {
            name: "to",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "tokenAddressTo",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "amountTo",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "chainFrom",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "chainTo",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "eventId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "flags",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "data",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "combinedSignatures",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "isValid",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "validate",
    inputs: [
      {
        name: "receipt",
        type: "tuple",
        internalType: "struct BridgeTypes.FullReceipt",
        components: [
          {
            name: "from",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "to",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "tokenAddressFrom",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "tokenAddressTo",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "amountFrom",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "amountTo",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "chainFrom",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "chainTo",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "eventId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "flags",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "data",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "combinedSignatures",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "isValid",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "validatePayload",
    inputs: [
      {
        name: "payload",
        type: "tuple",
        internalType: "struct BridgeTypes.SendPayload",
        components: [
          {
            name: "chainFrom",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "chainTo",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "tokenAddress",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "externalTokenAddress",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "amountToSend",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "feeAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "timestamp",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "flags",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "flagData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "signature",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "isValid",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AuthorityUpdated",
    inputs: [
      {
        name: "authority",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FeeValidityWindowChanged",
    inputs: [
      {
        name: "changer",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "validityWindow",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      {
        name: "version",
        type: "uint64",
        indexed: false,
        internalType: "uint64",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PayloadSignerChanged",
    inputs: [
      {
        name: "changer",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "payloadSigner",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ValidatorAdded",
    inputs: [
      {
        name: "validator",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ValidatorRemoved",
    inputs: [
      {
        name: "validator",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "AccessManagedInvalidAuthority",
    inputs: [
      {
        name: "authority",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "AccessManagedRequiredDelay",
    inputs: [
      {
        name: "caller",
        type: "address",
        internalType: "address",
      },
      {
        name: "delay",
        type: "uint32",
        internalType: "uint32",
      },
    ],
  },
  {
    type: "error",
    name: "AccessManagedUnauthorized",
    inputs: [
      {
        name: "caller",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ECDSAInvalidSignature",
    inputs: [],
  },
  {
    type: "error",
    name: "ECDSAInvalidSignatureLength",
    inputs: [
      {
        name: "length",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "ECDSAInvalidSignatureS",
    inputs: [
      {
        name: "s",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidSignatureLength",
    inputs: [
      {
        name: "length",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "NoFeeValidityWindow",
    inputs: [],
  },
  {
    type: "error",
    name: "NoPayloadSigner",
    inputs: [],
  },
  {
    type: "error",
    name: "NoValidators",
    inputs: [],
  },
  {
    type: "error",
    name: "NotInitializing",
    inputs: [],
  },
  {
    type: "error",
    name: "SignatureCountMismatch",
    inputs: [
      {
        name: "count",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "required",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "UnknownSigner",
    inputs: [
      {
        name: "signer",
        type: "address",
        internalType: "address",
      },
    ],
  },
];
