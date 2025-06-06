import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddressSync,
  NATIVE_MINT
} from "@solana/spl-token";

export async function wrapSolInstructions(connection: Connection, user: PublicKey, amountToSend: number) {
  const instructions = [];

  const userATA = getAssociatedTokenAddressSync(NATIVE_MINT, user);

  let balance = 0;
  try {
    balance = +(await connection.getTokenAccountBalance(userATA)).value.amount;
  } catch (e) {
    console.log("need to create user WSOL ATA")
    instructions.push(
      createAssociatedTokenAccountInstruction(user, userATA, user, NATIVE_MINT)
    );
  }

  if (balance < amountToSend) {
    console.log("need to wrap some SOL", amountToSend - balance)
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: user,
        toPubkey: userATA,
        lamports: amountToSend - balance,
      }),
      createSyncNativeInstruction(userATA)  // update ata balance
    );
  }

  return instructions;
}


export function unwrapWSolInstruction(userPubkey: PublicKey) {
  // can't specify amount to unwrap, so just close the account and send all SOL to user
  const userATA = getAssociatedTokenAddressSync(NATIVE_MINT, userPubkey);
  return createCloseAccountInstruction(userATA, userPubkey, userPubkey);

}
