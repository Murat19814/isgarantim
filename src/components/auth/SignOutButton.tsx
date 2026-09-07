"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="btn-ghost text-sm"
    >
      <LogOut className="h-4 w-4" /> Çıkış
    </button>
  );
}
