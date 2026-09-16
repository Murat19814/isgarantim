import Link from "next/link";
import { LogIn, LogOut, ShieldAlert, Search, Globe } from "lucide-react";
import {
  listLoginEvents,
  loginCountsByCountry,
  type LoginEventFilter,
} from "@/lib/services/loginLog";

export const metadata = { title: "Giriş Logları — Admin" };
export const dynamic = "force-dynamic";

const TYPE_META: Record<
  string,
  { label: string; cls: string; icon: typeof LogIn }
> = {
  LOGIN: { label: "Giriş", cls: "badge-emerald", icon: LogIn },
  LOGOUT: { label: "Çıkış", cls: "badge-navy", icon: LogOut },
  LOGIN_FAILED: { label: "Başarısız", cls: "badge-gold", icon: ShieldAlert },
};

function flag(code: string | null): string {
  if (!code || code.length !== 2) return "🌐";
  const base = 0x1f1e6;
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => base + (c.charCodeAt(0) - 65)),
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filter: LoginEventFilter = {
    type: sp.type || undefined,
    country: sp.country || undefined,
    q: sp.q || undefined,
  };

  const [events, byCountry] = await Promise.all([
    listLoginEvents(filter),
    loginCountsByCountry(),
  ]);

  const TYPES = [
    { value: "", label: "Tümü" },
    { value: "LOGIN", label: "Giriş" },
    { value: "LOGOUT", label: "Çıkış" },
    { value: "LOGIN_FAILED", label: "Başarısız" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900">
        Giriş / Çıkış Logları
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Kim, ne zaman, hangi IP ve ülkeden giriş/çıkış yaptı. Son {events.length} kayıt gösteriliyor.
      </p>

      {/* Ülke özeti */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/giris-loglari"
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm ${
            !filter.country
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-navy-200 bg-white text-navy-700 hover:border-navy-300"
          }`}
        >
          <Globe className="h-4 w-4" /> Tüm ülkeler
        </Link>
        {byCountry.slice(0, 12).map((c) => (
          <Link
            key={c.countryCode ?? c.country}
            href={`/admin/giris-loglari?country=${c.countryCode ?? ""}`}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm ${
              filter.country === c.countryCode
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-navy-200 bg-white text-navy-700 hover:border-navy-300"
            }`}
          >
            <span>{flag(c.countryCode)}</span>
            <span className="font-medium">{c.country}</span>
            <span className="rounded-full bg-navy-100 px-2 text-xs font-semibold text-navy-600">
              {c.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Filtre formu */}
      <form
        method="get"
        className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-navy-100 bg-white p-4"
      >
        {filter.country && (
          <input type="hidden" name="country" value={filter.country} />
        )}
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">Tür</label>
          <select name="type" defaultValue={filter.type ?? ""} className="input">
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-navy-700">
            Ara (e-posta / IP / şehir)
          </label>
          <input
            name="q"
            defaultValue={filter.q ?? ""}
            className="input"
            placeholder="ornek@eposta.com veya 88.x.x.x"
          />
        </div>
        <button type="submit" className="btn-primary">
          <Search className="h-4 w-4" /> Filtrele
        </button>
      </form>

      {/* Tablo */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-100 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase text-navy-400">
              <th className="px-4 py-3">Tür</th>
              <th className="px-4 py-3">Kullanıcı</th>
              <th className="px-4 py-3">Ülke / Şehir</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-navy-400">
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
            {events.map((e) => {
              const meta = TYPE_META[e.type] ?? TYPE_META.LOGIN;
              const Icon = meta.icon;
              return (
                <tr key={e.id} className="border-b border-navy-50 last:border-0">
                  <td className="px-4 py-3">
                    <span className={`${meta.cls} inline-flex items-center gap-1`}>
                      <Icon className="h-3 w-3" /> {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy-900">
                      {e.user?.fullName ?? "—"}
                    </div>
                    <div className="text-xs text-navy-400">{e.email ?? "?"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="mr-1">{flag(e.countryCode)}</span>
                    {e.country ?? "Bilinmiyor"}
                    {e.city ? (
                      <span className="text-navy-400"> · {e.city}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-navy-600">
                    {e.ip ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-navy-600">
                    {e.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
