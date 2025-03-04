import { Idl } from "@coral-xyz/anchor";

export const bridgeIdl = {
  address: "ambZMSUBvU8bLfxop5uupQd9tcafeJKea1KoyTv2yM1",
  metadata: {
    name: "amb_sol_bridge",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor",
  },
  instructions: [
    {
      name: "initialize",
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237],
      accounts: [
        {
          name: "state",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101],
              },
            ],
          },
        },
        {
          name: "admin",
          writable: true,
          signer: true,
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
      ],
      args: [
        {
          name: "send_signer",
          type: "pubkey",
        },
        {
          name: "receive_signer",
          type: "pubkey",
        },
      ],
    },
    {
      name: "initialize_token",
      discriminator: [38, 209, 150, 50, 190, 117, 16, 54],
      accounts: [
        {
          name: "state",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101],
              },
            ],
          },
        },
        {
          name: "admin",
          writable: true,
          signer: true,
          relations: ["state"],
        },
        {
          name: "bridge_token",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [116, 111, 107, 101, 110],
              },
              {
                kind: "account",
                path: "mint",
              },
            ],
          },
        },
        {
          name: "bridge_token_account",
          writable: true,
          optional: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "bridge_token",
              },
              {
                kind: "const",
                value: [
                  6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206,
                  235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140,
                  245, 133, 126, 255, 0, 169,
                ],
              },
              {
                kind: "account",
                path: "mint",
              },
            ],
            program: {
              kind: "const",
              value: [
                140, 151, 37, 143, 78, 36, 137, 241, 187, 61, 16, 41, 20, 142,
                13, 131, 11, 90, 19, 153, 218, 255, 16, 132, 4, 142, 123, 216,
                219, 233, 248, 89,
              ],
            },
          },
        },
        {
          name: "mint",
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        },
        {
          name: "associated_token_program",
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
      ],
      args: [
        {
          name: "amb_token",
          type: {
            array: ["u8", 20],
          },
        },
        {
          name: "amb_decimals",
          type: "u8",
        },
        {
          name: "is_mintable",
          type: "bool",
        },
      ],
    },
    {
      name: "receive",
      discriminator: [86, 17, 255, 171, 17, 17, 187, 219],
      accounts: [
        {
          name: "state",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101],
              },
            ],
          },
        },
        {
          name: "receiver",
          writable: true,
          signer: true,
        },
        {
          name: "receiver_token_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "receiver",
              },
              {
                kind: "const",
                value: [
                  6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206,
                  235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140,
                  245, 133, 126, 255, 0, 169,
                ],
              },
              {
                kind: "account",
                path: "mint",
              },
            ],
            program: {
              kind: "const",
              value: [
                140, 151, 37, 143, 78, 36, 137, 241, 187, 61, 16, 41, 20, 142,
                13, 131, 11, 90, 19, 153, 218, 255, 16, 132, 4, 142, 123, 216,
                219, 233, 248, 89,
              ],
            },
          },
        },
        {
          name: "receiver_nonce_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [110, 111, 110, 99, 101],
              },
              {
                kind: "account",
                path: "receiver",
              },
            ],
          },
        },
        {
          name: "bridge_token",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [116, 111, 107, 101, 110],
              },
              {
                kind: "account",
                path: "mint",
              },
            ],
          },
        },
        {
          name: "bridge_token_account",
          writable: true,
          optional: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "bridge_token",
              },
              {
                kind: "const",
                value: [
                  6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206,
                  235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140,
                  245, 133, 126, 255, 0, 169,
                ],
              },
              {
                kind: "account",
                path: "mint",
              },
            ],
            program: {
              kind: "const",
              value: [
                140, 151, 37, 143, 78, 36, 137, 241, 187, 61, 16, 41, 20, 142,
                13, 131, 11, 90, 19, 153, 218, 255, 16, 132, 4, 142, 123, 216,
                219, 233, 248, 89,
              ],
            },
          },
        },
        {
          name: "mint",
          writable: true,
        },
        {
          name: "ix_sysvar",
          docs: [
            "the supplied Sysvar could be anything else.",
            "The Instruction Sysvar has not been implemented",
            "in the Anchor framework yet, so this is the safe approach.",
          ],
          address: "Sysvar1nstructions1111111111111111111111111",
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
      ],
      args: [
        {
          name: "serialized_args",
          type: "bytes",
        },
      ],
    },
    {
      name: "send",
      discriminator: [102, 251, 20, 187, 65, 75, 12, 69],
      accounts: [
        {
          name: "state",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101],
              },
            ],
          },
        },
        {
          name: "sender",
          writable: true,
          signer: true,
        },
        {
          name: "sender_token_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "sender",
              },
              {
                kind: "const",
                value: [
                  6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206,
                  235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140,
                  245, 133, 126, 255, 0, 169,
                ],
              },
              {
                kind: "account",
                path: "mint",
              },
            ],
            program: {
              kind: "const",
              value: [
                140, 151, 37, 143, 78, 36, 137, 241, 187, 61, 16, 41, 20, 142,
                13, 131, 11, 90, 19, 153, 218, 255, 16, 132, 4, 142, 123, 216,
                219, 233, 248, 89,
              ],
            },
          },
        },
        {
          name: "bridge_token",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [116, 111, 107, 101, 110],
              },
              {
                kind: "account",
                path: "mint",
              },
            ],
          },
        },
        {
          name: "bridge_token_account",
          writable: true,
          optional: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "bridge_token",
              },
              {
                kind: "const",
                value: [
                  6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206,
                  235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140,
                  245, 133, 126, 255, 0, 169,
                ],
              },
              {
                kind: "account",
                path: "mint",
              },
            ],
            program: {
              kind: "const",
              value: [
                140, 151, 37, 143, 78, 36, 137, 241, 187, 61, 16, 41, 20, 142,
                13, 131, 11, 90, 19, 153, 218, 255, 16, 132, 4, 142, 123, 216,
                219, 233, 248, 89,
              ],
            },
          },
        },
        {
          name: "mint",
          writable: true,
        },
        {
          name: "ix_sysvar",
          docs: [
            "the supplied Sysvar could be anything else.",
            "The Instruction Sysvar has not been implemented",
            "in the Anchor framework yet, so this is the safe approach.",
          ],
          address: "Sysvar1nstructions1111111111111111111111111",
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
      ],
      args: [
        {
          name: "serialized_args",
          type: "bytes",
        },
        {
          name: "recipient",
          type: {
            array: ["u8", 20],
          },
        },
      ],
    },
    {
      name: "set_pause",
      discriminator: [63, 32, 154, 2, 56, 103, 79, 45],
      accounts: [
        {
          name: "state",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101],
              },
            ],
          },
        },
        {
          name: "admin",
          writable: true,
          signer: true,
          relations: ["state"],
        },
      ],
      args: [
        {
          name: "pause",
          type: "bool",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "GlobalState",
      discriminator: [163, 46, 74, 168, 216, 123, 133, 98],
    },
    {
      name: "NonceAccount",
      discriminator: [110, 202, 133, 201, 147, 206, 238, 84],
    },
    {
      name: "TokenConfig",
      discriminator: [92, 73, 255, 43, 107, 51, 117, 101],
    },
  ],
  events: [
    {
      name: "ReceivePayload",
      discriminator: [106, 38, 196, 36, 206, 174, 71, 34],
    },
    {
      name: "SendEvent",
      discriminator: [140, 14, 81, 77, 70, 218, 3, 30],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidSignature",
      msg: "Signature invalid",
    },
    {
      code: 6001,
      name: "InvalidNonce",
      msg: "Invalid nonce",
    },
    {
      code: 6002,
      name: "InvalidToken",
      msg: "Invalid token",
    },
    {
      code: 6003,
      name: "InvalidSerialization",
      msg: "Invalid serialization",
    },
    {
      code: 6004,
      name: "InvalidArgs",
      msg: "Invalid input arguments",
    },
  ],
  types: [
    {
      name: "GlobalState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "admin",
            type: "pubkey",
          },
          {
            name: "send_signer",
            type: "pubkey",
          },
          {
            name: "receive_signer",
            type: "pubkey",
          },
          {
            name: "nonce",
            type: "u64",
          },
          {
            name: "pause",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "NonceAccount",
      type: {
        kind: "struct",
        fields: [
          {
            name: "nonce_counter",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "ReceivePayload",
      type: {
        kind: "struct",
        fields: [
          {
            name: "to",
            type: "pubkey",
          },
          {
            name: "token_address_to",
            type: "pubkey",
          },
          {
            name: "amount_to",
            type: "u64",
          },
          {
            name: "chain_to",
            type: "u64",
          },
          {
            name: "flags",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "flag_data",
            type: "bytes",
          },
        ],
      },
    },
    {
      name: "SendEvent",
      type: {
        kind: "struct",
        fields: [
          {
            name: "from",
            type: "pubkey",
          },
          {
            name: "to",
            type: {
              array: ["u8", 20],
            },
          },
          {
            name: "token_address_from",
            type: "pubkey",
          },
          {
            name: "token_address_to",
            type: {
              array: ["u8", 20],
            },
          },
          {
            name: "amount_from",
            type: "u64",
          },
          {
            name: "amount_to",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "chain_from",
            type: "u64",
          },
          {
            name: "chain_to",
            type: "u64",
          },
          {
            name: "event_id",
            type: "u64",
          },
          {
            name: "flags",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "flag_data",
            type: "bytes",
          },
        ],
      },
    },
    {
      name: "TokenConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "token",
            type: "pubkey",
          },
          {
            name: "amb_token",
            type: {
              array: ["u8", 20],
            },
          },
          {
            name: "amb_decimals",
            type: "u8",
          },
          {
            name: "is_mintable",
            type: "bool",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
  ],
} as const satisfies Idl;
export default bridgeIdl;
