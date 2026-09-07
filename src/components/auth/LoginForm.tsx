"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/panel";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      identifier: String(form.get("identifier") ?? ""),
      password: String(form.get("password") ?? ""),
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("E-posta/telefon veya şifre hatalı.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-800">
          E-posta veya Telefon
        </label>
        <input
          name="identifier"
          className="input"
          placeholder="ornek@eposta.com / 5XX XXX XX XX"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-800">
          Şifre
        </label>
        <input name="password" type="password" className="input" placeholder="••••••••" />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Giriş yap
      </button>
    </form>
  );
}
