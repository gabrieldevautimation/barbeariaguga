import { drizzle } from "drizzle-orm/mysql2";
import { barbers } from "./drizzle/schema.js";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

try {
  const result = await db.select().from(barbers);
  console.log("Barbeiros no BD:", JSON.stringify(result, null, 2));
  console.log("Total:", result.length);
} catch (error) {
  console.error("Erro:", error);
}

process.exit(0);
