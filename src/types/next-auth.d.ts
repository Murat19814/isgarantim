import { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: UserRole[];
      emailVerified: boolean;
      phoneVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    roles: UserRole[];
    emailVerified: Date | null;
    phoneVerified: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roles: UserRole[];
    emailVerified: boolean;
    phoneVerified: boolean;
  }
}
