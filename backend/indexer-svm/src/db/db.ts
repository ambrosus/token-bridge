import { config } from "dotenv";
config();
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL);

export default db;
