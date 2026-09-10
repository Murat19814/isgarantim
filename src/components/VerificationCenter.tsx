"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Clock, XCircle, ShieldCheck, Lock } from "lucide-react";
import { FileUpload } from "@/components/ui/FileUpload";
import { VerificationBadges } from "@/components/VerificationBadges";
import { SUBMITTABLE_BADGES, VERIFICATION_STATUS_LABELS } from "@/lib/badges";

type AppInfo = { status: string; adminNote: string | null };

export function VerificationCenter({
  badges,
  applications,
}: {
  badges: Record<string, boolean>;
  applications: Record<string, AppInfo>;
}) {
  return (
    <div className="space-y-6">
      {/* Mevcut rozetler */}
      <div className="card p-6">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h2 className="font-display text-lg font-bold text-navy-900">Rozetlerin</h2>
        </div>
        {Object.values(badges).some(Boolean) ? (
          <VerificationBadges badges={badges} size="md" />
        ) : (
          <p className="text-sm text-navy-500">Henüz aktif rozetin yok.</p>
        )}
        <p className="mt-3 text-xs text-navy-400">
          Telefon ve e-posta rozetleri, hesabını doğruladığında otomatik aktif olur.
        </p>
      </div>

      {/* Başvurular */}
      <div className="card p-6">
        <h2 className="mb-1 font-display text-lg font-bold text-navy-900">
          Belge ile doğrulama
        </h2>
        <p className="mb-4 inline-flex items-center gap-1 text-xs text-navy-400">
          <Lock className="h-3.5 w-3.5" /> Belgeler gizli tutulur, herkese açık gösterilmez.
        </p>
        <div className="space-y-3">
          {SUBMITTABLE_BADGES.map((b) => (
            <VerificationRow
              key={b.type}
              type={b.type}
              label={b.label}
              hint={b.hint}
              approved={badges[b.type]}
              app={applications[b.type]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function VerificationRow({
  type,
  label,
  hint,
  approved,
  app,
}: {
  type: string;
  label: string;
  hint: string;
  approved: boolean;
  app?: AppInfo;
}) {
  const router = useRouter();
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const status = approved ? "APPROVED" : app?.status;

  async function submit() {
    if (!docUrl) {
      setError("Lütfen bir belge yükle.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, documentUrl: docUrl, note: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Başvuru gönderilemedi.");
        return;
      }
      setOpen(false);
      setDocUrl(null);
      setNote("");
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-navy-100 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-navy-900">{label}</p>
          <p className="text-xs text-navy-400">{hint}</p>
        </div>
        <StatusPill status={status} />
      </div>

      {app?.adminNote && status === "REJECTED" && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          Ekip notu: {app.adminNote}
        </p>
      )}

      {status !== "APPROVED" && status !== "PENDING" && !open && (
        <button onClick={() => setOpen(true)} className="btn-outline mt-3 text-sm">
          Belge yükle
        </button>
      )}

      {status === "REJECTED" && !open && (
        <button onClick={() => setOpen(true)} className="btn-outline mt-3 text-sm">
          Tekrar dene
        </button>
      )}

      {open && (
        <div className="mt-3 space-y-2">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <FileUpload
              accept="image/*,application/pdf"
              label={docUrl ? "Belge yüklendi ✓" : "Belge seç"}
              onUploaded={(url) => setDocUrl(url)}
            />
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="input resize-none"
            placeholder="Açıklama (opsiyonel)..."
          />
          <div className="flex gap-2">
            <button onClick={submit} disabled={loading} className="btn-primary text-sm">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Başvur"}
            </button>
            <button onClick={() => setOpen(false)} className="btn-ghost text-sm">
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status?: string }) {
  if (status === "APPROVED")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> {VERIFICATION_STATUS_LABELS.APPROVED}
      </span>
    );
  if (status === "PENDING")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2 py-0.5 text-xs font-medium text-gold-600">
        <Clock className="h-3.5 w-3.5" /> {VERIFICATION_STATUS_LABELS.PENDING}
      </span>
    );
  if (status === "REJECTED")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        <XCircle className="h-3.5 w-3.5" /> {VERIFICATION_STATUS_LABELS.REJECTED}
      </span>
    );
  return <span className="text-xs text-navy-400">Başvurulmadı</span>;
}
