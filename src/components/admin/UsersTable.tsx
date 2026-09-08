"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Ban, ShieldCheck, Loader2, UserCog, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type UserRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  roles: string[];
  banned: boolean;
  verified: boolean;
  createdAt: string;
};

const ROLE_TR: Record<string, string> = {
  CUSTOMER: "Müşteri",
  PROVIDER: "Hizmet Veren",
  JOBSEEKER: "İş Arayan",
  EMPLOYER: "İşveren",
  ADMIN: "Admin",
};
const ALL_ROLES = ["CUSTOMER", "PROVIDER", "JOBSEEKER", "EMPLOYER", "ADMIN"];

export function UsersTable({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draftRoles, setDraftRoles] = useState<string[]>([]);

  const filtered = users.filter((u) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.phone.includes(s)
    );
  });

  async function toggleBan(u: UserRow) {
    setBusy(u.id + "ban");
    try {
      await fetch(`/api/admin/users/${u.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !u.banned }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  function startEdit(u: UserRow) {
    setEditing(u.id);
    setDraftRoles(u.roles);
  }

  function toggleRole(r: string) {
    setDraftRoles((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));
  }

  async function saveRoles(id: string) {
    if (draftRoles.length === 0) return;
    setBusy(id + "roles");
    try {
      await fetch(`/api/admin/users/${id}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: draftRoles }),
      });
      setEditing(null);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ad, e-posta veya telefon ara..."
          className="input pl-9"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-navy-50 text-left text-xs uppercase text-navy-500">
              <tr>
                <th className="px-4 py-3">Kullanıcı</th>
                <th className="px-4 py-3">Roller</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {filtered.map((u) => (
                <tr key={u.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy-900">{u.fullName}</p>
                    <p className="text-xs text-navy-400">{u.email}</p>
                    {u.phone && <p className="text-xs text-navy-400">{u.phone}</p>}
                    <p className="mt-0.5 text-[11px] text-navy-300">{u.createdAt}</p>
                  </td>
                  <td className="px-4 py-3">
                    {editing === u.id ? (
                      <div className="space-y-1.5">
                        {ALL_ROLES.map((r) => (
                          <label key={r} className="flex items-center gap-1.5 text-xs">
                            <input
                              type="checkbox"
                              checked={draftRoles.includes(r)}
                              onChange={() => toggleRole(r)}
                            />
                            {ROLE_TR[r]}
                          </label>
                        ))}
                        <div className="flex gap-1 pt-1">
                          <button
                            onClick={() => saveRoles(u.id)}
                            disabled={busy === u.id + "roles"}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs text-white"
                          >
                            {busy === u.id + "roles" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            Kaydet
                          </button>
                          <button onClick={() => setEditing(null)} className="inline-flex items-center gap-1 rounded-md border border-navy-200 px-2 py-1 text-xs">
                            <X className="h-3 w-3" /> İptal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span key={r} className="rounded-full bg-navy-100 px-2 py-0.5 text-xs text-navy-600">
                            {ROLE_TR[r] ?? r}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.banned ? (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">Yasaklı</span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">Aktif</span>
                    )}
                    {u.verified && (
                      <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-navy-50 px-2 py-0.5 text-[11px] text-navy-500">
                        <ShieldCheck className="h-3 w-3" /> Doğrulanmış
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => startEdit(u)}
                        className="inline-flex items-center gap-1 rounded-md border border-navy-200 px-2 py-1 text-xs text-navy-600 hover:bg-navy-50"
                      >
                        <UserCog className="h-3.5 w-3.5" /> Roller
                      </button>
                      <button
                        onClick={() => toggleBan(u)}
                        disabled={busy === u.id + "ban"}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
                          u.banned
                            ? "border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            : "border border-red-200 text-red-600 hover:bg-red-50",
                        )}
                      >
                        {busy === u.id + "ban" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                        {u.banned ? "Yasağı kaldır" : "Yasakla"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-navy-400">
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
