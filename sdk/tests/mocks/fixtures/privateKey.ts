import { Address, Hex, toHex } from "viem";
import { mnemonicToAccount } from "viem/accounts";

// WARNING: DO NOT USE THESE MNEMONICS IN PRODUCTION, ONLY FOR TESTING
const FIXTURE_MNEMONIC =
  "meadow mean stadium reject enable leader decline palace knee hope bronze question able lottery multiply";

// WARNING: DO NOT USE THESE MNEMONICS IN PRODUCTION, ONLY FOR TESTING
const ACCOUNT_MNEMONIC =
  "cigar gauge chase winner gym infant shadow planet deal client document deputy mother fun tiger";

class MnemonicFixture {
  static mnemonic = FIXTURE_MNEMONIC;
  static derivationPath: `m/44'/60'/${string}`;

  private static get account() {
    return mnemonicToAccount(this.mnemonic, {
      path: this.derivationPath,
    });
  }

  static get address(): Address {
    return this.account.address;
  }

  static get privateKey(): Hex {
    return toHex(this.account.getHdKey().privateKey!);
  }
}

export class AccountFixture extends MnemonicFixture {
  static mnemonic = ACCOUNT_MNEMONIC;
  static derivationPath: `m/44'/60'/${string}` = "m/44'/60'/0'/0/0";
}

export class PayloadSignerFixture extends MnemonicFixture {
  static derivationPath: `m/44'/60'/${string}` = "m/44'/60'/0'/0/0";
}

export class Relay1SignerFixture extends MnemonicFixture {
  static derivationPath: `m/44'/60'/${string}` = "m/44'/60'/0'/0/1";
}

export class Relay2SignerFixture extends MnemonicFixture {
  static derivationPath: `m/44'/60'/${string}` = "m/44'/60'/0'/0/2";
}

export class Relay3SignerFixture extends MnemonicFixture {
  static derivationPath: `m/44'/60'/${string}` = "m/44'/60'/0'/0/3";
}

export class Relay4SignerFixture extends MnemonicFixture {
  static derivationPath: `m/44'/60'/${string}` = "m/44'/60'/0'/0/4";
}

export class Relay5SignerFixture extends MnemonicFixture {
  static derivationPath: `m/44'/60'/${string}` = "m/44'/60'/0'/0/5";
}
