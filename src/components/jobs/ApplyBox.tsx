"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

export function ApplyBox({
  postingId,
  alreadyApplied,
}: {
  postingId: string;
  alreadyApplied: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cover, setCover] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(alreadyApplied);
  const [err, setErr] = useState<string | null>(null);

  async function apply() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/job-postings/${postingId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverLetter: cover || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Başvuru yapılamadı.");
        return;
      }
      setDone(true);
      setOpen(false);
      router.refresh();
    } catch {
      setErr("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
        <CheckCircle2 className="h-5 w-5" /> Bu ilana başvurdun. Durumu panelinden takip edebilirsin.
      </div>
    );
  }

  return (
    <div>
      {err && <div className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}
      {!open ? (
        <button onClick={() => setOpen(true)} className="btn-primary w-full">
          <Send className="h-4 w-4" /> Bu ilana başvur
        </button>
      ) : (
        <div className="space-y-3">
          <textarea
            className="input resize-none"
            rows={4}
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            placeholder="Ön yazı (opsiyonel) — kendini kısaca tanıt"
          />
          <p className="text-xs text-navy-400">
            CV'n varsa başvuruya otomatik eklenir. CV oluşturmak için panele git.
          </p>
          <div className="flex gap-2">
            <button onClick={apply} disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Başvuruyu gönder
            </button>
            <button onClick={() => setOpen(false)} className="btn-outline">Vazgeç</button>
          </div>
        </div>
      )}
    </div>
  );
}
