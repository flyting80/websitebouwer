import type { Config } from "drizzle-kit";

const isLocal = !process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:") || process.env.DATABASE_URL === "local";

export default (isLocal
  ? {
      schema: "./lib/db/schema-sqlite.ts",
      out: "./drizzle",
      dialect: "sqlite",
      dbCredentials: {
        url: "./local.db",
      },
    }
  : {
      schema: "./lib/db/schema.ts",
      out: "./drizzle",
      dialect: "postgresql",
      dbCredentials: {
        url: process.env.DATABASE_URL!,
      },
    }) satisfies Config;
