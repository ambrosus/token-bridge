import { Hex } from "viem";
import { FullReceipt } from "../../../src/evm/types";

export const receipts: Array<{
  receipt: FullReceipt;
  hash: Hex;
  signature: Hex;
}> = [
  {
    receipt: {
      from: "0x111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEEFFFFCCCC",
      to: "0x000000000000000000000000e0b52ec5ce3e124ab5306ea42463be85aeb5eddd",
      tokenAddressFrom:
        "0x54455354494e4700000000000000000000000000000000000000000000000000",
      tokenAddressTo:
        "0x0000000000000000000000006deE265d22085F4c0BB1582BF0BAd8a6Af0309d9",
      amountFrom: 1000000000000000000000n,
      amountTo: 1000000000000000000000n,
      chainFrom:
        37682073643888590243866347653768361305805979805942384833434275429159048052736n,
      chainTo: 22040n,
      eventId: 0n,
      flags: 0n,
      data: "0x",
    },
    hash: "0x56d78f233132a401208e5ba9b7959aa22719eeb4213283e299d57195399f648e",
    signature:
      "0xec2aa3208477a72a31e272918f75b391c84a287e14cbb673252bb1bd16e0e0374edc802812a3c18e77e6267e26fd27b20af9ceddd65a9a3fc945bd48e907d0fb1b",
  },
  {
    receipt: {
      from: "0x111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEEFFFFCCCC",
      to: "0x000000000000000000000000e0b52ec5ce3e124ab5306ea42463be85aeb5eddd",
      tokenAddressFrom:
        "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
      tokenAddressTo:
        "0x0000000000000000000000005B9E2BD997bc8f6aE97145cE0a8dEE075653f1AA",
      amountFrom: 1000000000000000000000n,
      amountTo: 1000000000000000n,
      chainFrom: 6003100671677645902n,
      chainTo: 22040n,
      eventId: 12345n,
      flags: 0n,
      data: "0x",
    },
    hash: "0x9d32d2270629b95b2590e468a8ac108e706bf888cdb4b8b5dee3f6d6db4f6aff",
    signature:
      "0x57968624687a307f78000354d379cfc48b574d293f0e01fac422a2c43470099f29b156ebace947575853199fba54810a6165947a1c0ad6b40cd9558363a48d801c",
  },
];