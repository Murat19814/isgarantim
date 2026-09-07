"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, HandHelping, Wrench, Briefcase, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS = [
  { value: "CUSTOMER", label: "Hizmet Al", icon: HandHelping },
  { value: "PROVIDER", label: "Hizmet Ver", icon: Wrench },
  { value: "JOBSEEKER", label: "İş Ara", icon: Briefcase },
  { value: "EMPLOYER", label: "İşveren / Firma", icon: Building2 },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const [roles, setRoles] = useState<string[]>(["CUSTOMER"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function toggleRole(value: string) {
    setRoles((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const form = new FormData(e.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      password: String(form.get("password") ?? ""),
      roles,
    };

    try {
      const res = await fetch("/api/auth/register", {
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
      router.push(`/dogrula?userId=${data.userId}`);
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
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
          Ad Soyad
        </label>
        <input name="fullName" className="input" placeholder="Adın Soyadın" />
        <FieldError errors={fieldErrors.fullName} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-800">
          E-posta
        </label>
        <input
          name="email"
          type="email"
          className="input"
          placeholder="ornek@eposta.com"
        />
        <FieldError errors={fieldErrors.email} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-800">
          Cep Telefonu
        </label>
        <input name="phone" className="input" placeholder="5XX XXX XX XX" />
        <FieldError errors={fieldErrors.phone} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy-800">
          Şifre
        </label>
        <input
          name="password"
          type="password"
          className="input"
          placeholder="En az 8 karakter, büyük/küçük harf + rakam"
        />
        <FieldError errors={fieldErrors.password} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-navy-800">
          Ne yapmak istiyorsun? (birden fazla seçebilirsin)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_OPTIONS.map((r) => {
            const Icon = r.icon;
            const active = roles.includes(r.value);
            return (
              <button
                type="button"
                key={r.value}
                onClick={() => toggleRole(r.value)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all",
                  active
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-navy-200 bg-white text-navy-700 hover:border-navy-300",
                )}
              >
                <Icon className="h-4 w-4" />
                {r.label}
              </button>
            );
          })}
        </div>
        <FieldError errors={fieldErrors.roles} />
        <p className="mt-2 text-xs text-navy-400">
          Rolleri sonradan hesabından da değiştirebilirsin.
        </p>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Hesabımı oluştur
      </button>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-red-600">{errors[0]}</p>;
}
