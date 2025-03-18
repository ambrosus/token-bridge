import { type Abi } from "viem";

export const bridgeAbi: Abi = [
  {
    type: "receive",
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "addToken",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "externalToken_",
        type: "tuple",
        internalType: "struct ITokenManager.ExternalTokenUnmapped",
        components: [
          {
            name: "externalTokenAddress",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "decimals",
            type: "uint8",
            internalType: "uint8",
          },
        ],
      },
      {
        name: "paused",
        type: "bool",
        internalType: "bool",
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
    name: "addToken",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "externalToken_",
        type: "tuple",
        internalType: "struct ITokenManager.ExternalTokenUnmapped",
        components: [
          {
            name: "externalTokenAddress",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "decimals",
            type: "uint8",
            internalType: "uint8",
          },
        ],
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
    name: "bridgableTokens",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "isBridgable_",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "claim",
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
        name: "signature",
        type: "bytes",
        internalType: "bytes",
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
    name: "claim",
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
        name: "signature",
        type: "bytes",
        internalType: "bytes",
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
    name: "deployExternalTokenERC20",
    inputs: [
      {
        name: "externalToken_",
        type: "tuple",
        internalType: "struct ITokenManager.ExternalTokenUnmapped",
        components: [
          {
            name: "externalTokenAddress",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "decimals",
            type: "uint8",
            internalType: "uint8",
          },
        ],
      },
      {
        name: "name",
        type: "string",
        internalType: "string",
      },
      {
        name: "symbol",
        type: "string",
        internalType: "string",
      },
      {
        name: "decimals",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    outputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "external2token",
    inputs: [
      {
        name: "externalTokenAddress",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "externalToken",
    inputs: [
      {
        name: "externalTokenAddress",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "_externalToken",
        type: "tuple",
        internalType: "struct ITokenManager.ExternalToken",
        components: [
          {
            name: "externalTokenAddress",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "tokenAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "decimals",
            type: "uint8",
            internalType: "uint8",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "feeReceiver",
    inputs: [],
    outputs: [
      {
        name: "feeReceiver_",
        type: "address",
        internalType: "address payable",
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
        name: "validityWindow",
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
        name: "tokenBeacon_",
        type: "address",
        internalType: "address",
      },
      {
        name: "SAMB_",
        type: "address",
        internalType: "address",
      },
      {
        name: "validator_",
        type: "address",
        internalType: "contract IValidation",
      },
      {
        name: "feeReceiver_",
        type: "address",
        internalType: "address payable",
      },
      {
        name: "nativeSendAmount_",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isClaimed",
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
    ],
    outputs: [
      {
        name: "claimed",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isClaimed",
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
    ],
    outputs: [
      {
        name: "claimed",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isClaimed",
    inputs: [
      {
        name: "receiptHash",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "claimed",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
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
    name: "mapExternalToken",
    inputs: [
      {
        name: "externalToken_",
        type: "tuple",
        internalType: "struct ITokenManager.ExternalTokenUnmapped",
        components: [
          {
            name: "externalTokenAddress",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "decimals",
            type: "uint8",
            internalType: "uint8",
          },
        ],
      },
      {
        name: "token",
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
    name: "nativeSendAmount",
    inputs: [],
    outputs: [
      {
        name: "nativeSendAmount_",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nextEventID",
    inputs: [],
    outputs: [
      {
        name: "nonce",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nonces",
    inputs: [
      {
        name: "key",
        type: "uint256",
        internalType: "uint256",
      },
    ],
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
    name: "nonces",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
    ],
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
    name: "nonces",
    inputs: [
      {
        name: "key",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
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
    name: "pauseToken",
    inputs: [
      {
        name: "token",
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
    name: "pausedTokens",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "isPaused",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "removeToken",
    inputs: [
      {
        name: "token",
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
    name: "samb",
    inputs: [],
    outputs: [
      {
        name: "SAMB",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "send",
    inputs: [
      {
        name: "recipient",
        type: "bytes32",
        internalType: "bytes32",
      },
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
        name: "payloadSignature",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
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
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "send",
    inputs: [
      {
        name: "recipient",
        type: "bytes32",
        internalType: "bytes32",
      },
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
        name: "payloadSignature",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "_deadline",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "v",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "r",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "s",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
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
    ],
    stateMutability: "payable",
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
    name: "setFeeReceiver",
    inputs: [
      {
        name: "newFeeReceiver",
        type: "address",
        internalType: "address payable",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setNativeSendAmount",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setValidator",
    inputs: [
      {
        name: "newValidator",
        type: "address",
        internalType: "contract IValidation",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unmapExternalToken",
    inputs: [
      {
        name: "externalTokenAddress",
        type: "bytes32",
        internalType: "bytes32",
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
    name: "unpauseToken",
    inputs: [
      {
        name: "token",
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
    name: "validator",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IValidation",
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
    name: "FeeReceiverChanged",
    inputs: [
      {
        name: "changer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newFeeReceiver",
        type: "address",
        indexed: true,
        internalType: "address",
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
    name: "NativeSendAmountChanged",
    inputs: [
      {
        name: "changer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newNativeSendAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenAdded",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenDeployed",
    inputs: [
      {
        name: "name",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "symbol",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "decimals",
        type: "uint8",
        indexed: false,
        internalType: "uint8",
      },
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenLocked",
    inputs: [
      {
        name: "receipt",
        type: "tuple",
        indexed: false,
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
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenMapped",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "externalTokenAddress",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenPaused",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenRemoved",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenUnlocked",
    inputs: [
      {
        name: "receipt",
        type: "tuple",
        indexed: false,
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
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenUnmapped",
    inputs: [
      {
        name: "externalTokenAddress",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenUnpaused",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ValidatorChanged",
    inputs: [
      {
        name: "changer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newValidator",
        type: "address",
        indexed: true,
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
    name: "Claimed",
    inputs: [
      {
        name: "hash",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "InvalidAccountNonce",
    inputs: [
      {
        name: "key",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "currentNonce",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "InvalidAmount",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidChain",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidPermitFlag",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidValueSent",
    inputs: [
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "expectedValue",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "NotInitializing",
    inputs: [],
  },
  {
    type: "error",
    name: "SendFailed",
    inputs: [],
  },
  {
    type: "error",
    name: "TokenAlreadyAdded",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "TokenAlreadyMapped",
    inputs: [
      {
        name: "externalTokenAddress",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "TokenIsPaused",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "TokenNotAdded",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "TokenNotBridgable",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "TokenNotMapped",
    inputs: [
      {
        name: "externalTokenAddress",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "TokenNotPaused",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "TokenZeroAddress",
    inputs: [],
  },
  {
    type: "error",
    name: "TransferFailed",
    inputs: [],
  },
];
