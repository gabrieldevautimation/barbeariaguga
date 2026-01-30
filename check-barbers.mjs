import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { barbers } from "./drizzle/schema.ts";
import "dotenv/config";

const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });
const db = drizzle(client);

try {
  const result = await db.select().from(barbers);
  console.log("Barbeiros no BD:", JSON.stringify(result, null, 2));
  console.log("Total:", result.length);
} catch (error) {
  console.error("Erro:", error);
}

process.exit(0);
