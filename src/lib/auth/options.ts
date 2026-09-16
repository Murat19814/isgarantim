import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { normalizePhone } from "@/lib/validations/auth";
import {
  recordLoginEvent,
  ipFromHeaders,
  uaFromHeaders,
} from "@/lib/services/loginLog";

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
      async authorize(credentials, req) {
        const ip = ipFromHeaders(req?.headers);
        const userAgent = uaFromHeaders(req?.headers);
        const identifier = credentials?.identifier?.trim() ?? "";

        if (!credentials?.identifier || !credentials.password) return null;

        const id = identifier;
        const isEmail = id.includes("@");
        const user = await prisma.user.findFirst({
          where: isEmail
            ? { email: id.toLowerCase() }
            : { phone: normalizePhone(id) },
        });

        if (!user || user.isBanned || !user.isActive) {
          await recordLoginEvent({
            type: "LOGIN_FAILED",
            userId: user?.id ?? null,
            email: identifier,
            ip,
            userAgent,
          });
          return null;
        }

        const ok = await verifyPassword(credentials.password, user.passwordHash);
        if (!ok) {
          await recordLoginEvent({
            type: "LOGIN_FAILED",
            userId: user.id,
            email: identifier,
            ip,
            userAgent,
          });
          return null;
        }

        await recordLoginEvent({
          type: "LOGIN",
          userId: user.id,
          email: user.email,
          ip,
          userAgent,
        });

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
  events: {
    async signOut({ token }) {
      // Çıkışta IP başlığı elde edilemez; kullanıcı kimliğiyle kaydederiz.
      if (token?.id) {
        await recordLoginEvent({
          type: "LOGOUT",
          userId: token.id as string,
          email: (token.email as string | undefined) ?? null,
        });
      }
    },
  },
};
