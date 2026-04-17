import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const isLocalDb = process.env.DATABASE_URL?.includes("localhost") || process.env.DATABASE_URL?.includes("127.0.0.1");

const url = (() => {
  const raw = process.env.DATABASE_URL!;
  if (isLocalDb) return raw;
  return raw.includes("sslmode=") ? raw : raw + (raw.includes("?") ? "&" : "?") + "sslmode=require";
})();

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url,
    ssl: isLocalDb ? false : { rejectUnauthorized: false },
  },
});
