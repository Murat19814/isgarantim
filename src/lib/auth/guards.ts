import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth/session";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  roles: UserRole[];
  emailVerified: boolean;
  phoneVerified: boolean;
};

/** Oturumdaki kullanıcıyı döndürür, yoksa null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  return (session?.user as SessionUser) ?? null;
}

/** Belirli bir role sahip mi? */
export function hasRole(user: SessionUser | null, role: UserRole): boolean {
  return !!user?.roles?.includes(role);
}
