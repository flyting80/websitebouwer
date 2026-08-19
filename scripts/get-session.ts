import Database from "better-sqlite3";
import path from "path";
const db = new Database(path.join(process.cwd(), "local.db"));
const now = new Date().toISOString();
const row = db.prepare("SELECT session_token, expires FROM sessions WHERE expires > ? LIMIT 1").get(now) as { session_token: string; expires: string } | undefined;
if (row) {
  console.log("SESSION_TOKEN=" + row.session_token);
  console.log("EXPIRES=" + row.expires);
} else {
  console.log("Geen geldige sessie — run: npx tsx scripts/seed-demo.ts");
}
db.close();
