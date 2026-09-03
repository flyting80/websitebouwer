import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { APP_NAME } from "./app-branding";

/** Constant-time string compare that works on Edge (no Node crypto). */
function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let mismatch = a.length === b.length ? 0 : 1;
  for (let i = 0; i < len; i++) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return mismatch === 0;
}

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  // Only pass when set — `secret: undefined` triggers MissingSecret on Auth.js
  ...(authSecret ? { secret: authSecret } : {}),
  providers: [
    Credentials({
      name: APP_NAME,
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Wachtwoord", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) {
          console.error("[auth] ADMIN_EMAIL of ADMIN_PASSWORD ontbreekt");
          return null;
        }

        const email =
          typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const emailOk = safeEqual(email, adminEmail.trim().toLowerCase());
        const passwordOk = safeEqual(password, adminPassword);
        if (!emailOk || !passwordOk) return null;

        return {
          id: "admin",
          email: adminEmail,
          name: "Admin",
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 uur
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "admin";
      }
      return session;
    },
  },
});
