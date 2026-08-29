import NextAuth from "next-auth";

// Fail fast in production when AUTH_SECRET is missing or still at dev default
if (process.env.NODE_ENV === "production") {
  const secret = process.env.AUTH_SECRET ?? "";
  if (secret.length < 32 || secret.includes("dev-secret") || secret.includes("change-in-production")) {
    throw new Error(
      "[auth] AUTH_SECRET is onveilig voor productie. Stel een willekeurige string van minimaal 32 tekens in."
    );
  }
}
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, sessions, users, verificationTokens } from "./db/schema-sqlite";
import { APP_NAME } from "./app-branding";

// Build the correct DB for auth (must be a real DB, not a Proxy)
function buildAuthDb() {
  const url = process.env.DATABASE_URL;
  const useLocal = !url || url === "local" || url.startsWith("file:");

  if (useLocal) {
    const Database = require("better-sqlite3");
    const { drizzle } = require("drizzle-orm/better-sqlite3");
    const schema = require("./db/schema-sqlite");
    const path = require("path");
    const dbPath = path.join(process.cwd(), "local.db");
    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    return drizzle(sqlite, { schema });
  } else {
    const { neon } = require("@neondatabase/serverless");
    const { drizzle } = require("drizzle-orm/neon-http");
    const schema = require("./db/schema");
    return drizzle(neon(url), { schema });
  }
}

const authDb = buildAuthDb();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(authDb, {
    usersTable: users as Parameters<typeof DrizzleAdapter>[1] extends { usersTable?: infer U } ? U : never,
    accountsTable: accounts as Parameters<typeof DrizzleAdapter>[1] extends { accountsTable?: infer A } ? A : never,
    sessionsTable: sessions as Parameters<typeof DrizzleAdapter>[1] extends { sessionsTable?: infer S } ? S : never,
    verificationTokensTable: verificationTokens as Parameters<typeof DrizzleAdapter>[1] extends { verificationTokensTable?: infer V } ? V : never,
  }),
  providers: [
    Resend({
      from: process.env.EMAIL_FROM ?? "noreply@jouwdomein.nl",
      name: APP_NAME,
    }),
  ],
  pages: {
    signIn: "/admin/login",
    verifyRequest: "/admin/login/verify",
  },
  session: {
    maxAge: 8 * 60 * 60, // 8 uur
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
});
