import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { normalizePhone } from "@/lib/validations/auth";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/giris",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "E-posta veya Telefon", type: "text" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials.password) return null;

        const id = credentials.identifier.trim();
        const isEmail = id.includes("@");
        const user = await prisma.user.findFirst({
          where: isEmail
            ? { email: id.toLowerCase() }
            : { phone: normalizePhone(id) },
        });

        if (!user || user.isBanned || !user.isActive) return null;

        const ok = await verifyPassword(credentials.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          roles: user.roles,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.emailVerified = !!user.emailVerified;
        token.phoneVerified = !!user.phoneVerified;
      }
      // Oturum güncellendiğinde (ör. rol eklendiğinde) DB'den tazele
      if (trigger === "update" && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (fresh) {
          token.roles = fresh.roles;
          token.emailVerified = !!fresh.emailVerified;
          token.phoneVerified = !!fresh.phoneVerified;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.roles = token.roles;
        session.user.emailVerified = token.emailVerified;
        session.user.phoneVerified = token.phoneVerified;
      }
      return session;
    },
  },
};
