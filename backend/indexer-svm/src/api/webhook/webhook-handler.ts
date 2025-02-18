import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { BorshCoder, EventParser, Program } from "@coral-xyz/anchor";
import * as idl from "../../idl/idl.json";
import type { AmbSolBridge } from "../../idl/idlType";
import { receiptsMeta, receiptsSent } from "../../db/schema";
import { SolanaTransaction } from "./types";
import db from "../../db/db";
import { Idl } from "@coral-xyz/anchor/dist/cjs/idl";
import { padTo32Bytes, safeBigInt, safeHexToNumber, safeNumber, toHex, toHexFromBytes } from "./utils";

const programId = "ambav8knXhcnxFdp6nMg9HH6K9HjuS6noQNoRvNatCH";
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
export const program = new Program(idl as AmbSolBridge, { connection });

export async function webhookHandler(request, reply) {
  const events = request.body as SolanaTransaction[];
  const eventParser = new EventParser(new PublicKey(idl.address), new BorshCoder(idl as Idl));

  for (const event of events) {
    const logs = eventParser.parseLogs(event.meta.logMessages);

    for (const log of logs) {
      let insertValues: any = null;
      let model: any = null;

      try {
        if (log.name === "SendEvent") {
          console.log("RESULT!", processSendEvent(log, event));
          ({ model, values: insertValues } = processSendEvent(log, event));
        } else if (log.name === "ReceiveEvent") {
          console.log("ReceiveEvent:", log);
          continue; //TODO!
        }

        if (insertValues && model) {
          const entity = await db
            .insert(model)
            .values(insertValues)
            .onConflictDoNothing()
            .returning({ receiptId: model.receiptId });

          const metadata = {
            receiptId: entity[0].receiptId,
            //blockHash: event.slot, //Not applicable for Solana
            blockNumber: event.slot, //???
            timestamp: event.blockTime,
            transactionHash: event.transaction.signatures[0], // is this correct and always the first signature?
            transactionIndex: event.indexWithinBlock
          };
          await db
            .insert(receiptsMeta)
            .values({ ...metadata })
            .onConflictDoNothing();
        }
      } catch (err) {
        console.error("Error processing event:", log.name, err);
      }
    }
  }
  return "pong";
}

function processSendEvent(log: any, event: SolanaTransaction) {
  return {
    model: receiptsSent,
    values: {
      timestamp: event.blockTime,
      bridgeAddress: programId,
      from: toHex(log.data.from.toBase58()),
      to: toHexFromBytes(log.data.to),
      tokenAddressFrom: toHex(log.data.token_address_from.toBase58()),
      tokenAddressTo: toHexFromBytes(log.data.token_address_to),
      amountFrom: safeNumber(log.data.amount_from),
      amountTo: safeBigInt(log.data.amount_to),
      chainFrom: safeNumber(log.data.chain_from),
      chainTo: safeNumber(log.data.chain_to),
      eventId: safeNumber(log.data.event_id),
      flags: safeHexToNumber(log.data.flags),
      data: safeHexToNumber(log.data.flag_data)
    }
  };
}
