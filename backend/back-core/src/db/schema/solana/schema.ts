import { pgTable, pgSchema, text, numeric, integer, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const indexerSolana = pgSchema("indexer_solana");


export const receiptsMetaInIndexerSolana = indexerSolana.table("receiptsMeta", {
	receiptId: text("receipt_id").primaryKey().notNull(),
	eventChain: numeric("event_chain", { precision: 78, scale:  0 }),
	blockHash: text("block_hash"),
	blockNumber: numeric("block_number", { precision: 78, scale:  0 }),
	timestamp: numeric({ precision: 78, scale:  0 }),
	transactionHash: text("transaction_hash"),
	transactionIndex: integer("transaction_index"),
});

export const receiptsClaimedInIndexerSolana = indexerSolana.table("receiptsClaimed", {
	receiptId: text("receipt_id").notNull(),
	timestamp: numeric({ precision: 78, scale:  0 }).notNull(),
	bridgeAddress: text("bridge_address").notNull(),
	to: text().notNull(),
	tokenAddressTo: text("token_address_to").notNull(),
	amountTo: numeric("amount_to", { precision: 78, scale:  0 }).notNull(),
	chainTo: numeric("chain_to", { precision: 78, scale:  0 }).notNull(),
	chainFrom: numeric("chain_from", { precision: 78, scale:  0 }).notNull(),
	eventId: numeric("event_id", { precision: 78, scale:  0 }).notNull(),
	flags: numeric({ precision: 78, scale:  0 }).notNull(),
	data: text().notNull(),
}, (table) => [
	primaryKey({ columns: [table.chainTo, table.chainFrom, table.eventId], name: "receiptsClaimed_chain_from_chain_to_event_id_pk"}),
]);

export const receiptsSentInIndexerSolana = indexerSolana.table("receiptsSent", {
	receiptId: text("receipt_id").notNull(),
	timestamp: numeric({ precision: 78, scale:  0 }).notNull(),
	bridgeAddress: text("bridge_address").notNull(),
	from: text().notNull(),
	to: text().notNull(),
	tokenAddressFrom: text("token_address_from").notNull(),
	tokenAddressTo: text("token_address_to").notNull(),
	amountFrom: numeric("amount_from", { precision: 78, scale:  0 }).notNull(),
	amountTo: numeric("amount_to", { precision: 78, scale:  0 }).notNull(),
	chainFrom: numeric("chain_from", { precision: 78, scale:  0 }).notNull(),
	chainTo: numeric("chain_to", { precision: 78, scale:  0 }).notNull(),
	eventId: numeric("event_id", { precision: 78, scale:  0 }).notNull(),
	flags: numeric({ precision: 78, scale:  0 }).notNull(),
	data: text().notNull(),
}, (table) => [
	primaryKey({ columns: [table.chainFrom, table.chainTo, table.eventId], name: "receiptsSent_chain_from_chain_to_event_id_pk"}),
]);
