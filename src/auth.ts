import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import {
  findAuthUserByEmail,
  verifyCredentials,
} from "@/data/auth-users";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: (credentials) => verifyCredentials(credentials),
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider !== "google") {
        return true;
      }

      if (!user.email) {
        return false;
      }

      return Boolean(await findAuthUserByEmail(user.email));
    },
    async jwt({ token, user }) {
      const email = user?.email ?? token.email;
      if (email) {
        const databaseUser = await findAuthUserByEmail(email);
        if (databaseUser) {
          token.sub = String(databaseUser.id);
          token.role = databaseUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = String(token.role ?? "CUSTOMER");
      }

      return session;
    },
  },
});
