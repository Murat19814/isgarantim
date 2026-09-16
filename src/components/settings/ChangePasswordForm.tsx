"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    const form = new FormData(e.currentTarget);
    const payload = {
      currentPassword: String(form.get("currentPassword") ?? ""),
      newPassword: String(form.get("newPassword") ?? ""),
      newPasswordConfirm: String(form.get("newPasswordConfirm") ?? ""),
    };

    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir hata oluştu.");
        if (data.issues) setFieldErrors(data.issues);
        return;
      }
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Şifren başarıyla güncellendi.
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-800">
          Mevcut şifre
        </label>
        <input
          name="currentPassword"
          type="password"
          className="input"
          placeholder="••••••••"
          autoComplete="current-password"
        />
        <FieldError errors={fieldErrors.currentPassword} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-800">
          Yeni şifre
        </label>
        <input
          name="newPassword"
          type="password"
          className="input"
          placeholder="En az 8 karakter, büyük/küçük harf + rakam"
          autoComplete="new-password"
        />
        <FieldError errors={fieldErrors.newPassword} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-800">
          Yeni şifre (tekrar)
        </label>
        <input
          name="newPasswordConfirm"
          type="password"
          className="input"
          placeholder="Yeni şifreni tekrar gir"
          autoComplete="new-password"
        />
        <FieldError errors={fieldErrors.newPasswordConfirm} />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Şifreyi güncelle
      </button>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-red-600">{errors[0]}</p>;
}
