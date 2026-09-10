"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, CheckCircle2, Clock, FileText, Phone, Mail, Lock,
  PartyPopper, AlertTriangle, Play, Calendar, XCircle, ShieldAlert, Star, MessageSquare, Send,
} from "lucide-react";
import { formatTRY } from "@/lib/utils";
import { FileUpload } from "@/components/ui/FileUpload";
import { PROBLEM_LABELS } from "@/lib/problems";

type ReviewInfo = {
  id: string;
  rating: number;
  comment: string | null;
  providerReply: string | null;
} | null;

type Delivery = {
  note: string | null;
  files: string[];
  deliveredAt: string | null;
  approvedAt: string | null;
} | null;

export function ProviderWorkflow({
  requestId,
  status,
  agreedPrice,
  scheduledAt,
  delivery,
  customer,
  contactUnlocked,
  review,
}: {
  requestId: string;
  status: string;
  agreedPrice: number;
  scheduledAt: string | null;
  delivery: Delivery;
  customer: { fullName: string; phone: string | null; email: string | null } | null;
  contactUnlocked: boolean;
  review?: ReviewInfo;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<string[]>([]);

  async function call(path: string, body?: unknown, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setLoading(path);
    setError(null);
    try {
      const res = await fetch(`/api/service-requests/${requestId}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "İşlem başarısız.");
        return;
      }
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        <h2 className="font-display text-lg font-bold text-navy-900">İş süreci</h2>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Müşteri iletişimi */}
      {customer && (
        <div className="mb-4 rounded-xl border border-navy-100 bg-navy-50/50 p-4">
          <p className="text-xs text-navy-400">Müşteri</p>
          <p className="font-semibold text-navy-900">{customer.fullName}</p>
          <div className="mt-2 space-y-1 text-sm">
            {contactUnlocked ? (
              <>
                <p className="inline-flex items-center gap-1.5 text-navy-700">
                  <Phone className="h-4 w-4 text-emerald-600" /> {customer.phone ?? "—"}
                </p>
                <p className="inline-flex items-center gap-1.5 text-navy-700">
                  <Mail className="h-4 w-4 text-emerald-600" /> {customer.email ?? "—"}
                </p>
              </>
            ) : (
              <p className="inline-flex items-center gap-1.5 text-navy-400">
                <Lock className="h-4 w-4" /> Müşteri randevu oluşturunca iletişim açılır
              </p>
            )}
          </div>
        </div>
      )}

      {/* Kararlaştırılan tutar */}
      <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm">
        <p className="text-xs text-emerald-600">Kararlaştırılan tutar (doğrudan tahsil)</p>
        <p className="font-display text-xl font-bold text-emerald-700">{formatTRY(agreedPrice)}</p>
        <p className="mt-0.5 text-xs text-navy-400">1. yıl komisyon yok — tamamı senin.</p>
      </div>

      {scheduledAt && (
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-700">
          <Calendar className="h-4 w-4 text-emerald-600" /> Randevu:{" "}
          {new Date(scheduledAt).toLocaleString("tr-TR")}
        </div>
      )}

      {status === "OFFER_SELECTED" && (
        <div className="flex items-start gap-2 rounded-xl bg-gold-50 p-3 text-sm text-navy-700">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
          Teklifin kabul edildi! Müşterinin randevu oluşturmasını bekliyorsun.
        </div>
      )}

      {status === "SCHEDULED" && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            Randevu oluşturuldu. Zamanı geldiğinde "İşe başla" ile süreci başlat.
          </div>
          <button onClick={() => call("start", undefined, "İşe başladığını bildir?")}
            disabled={loading !== null} className="btn-primary w-full">
            {loading === "start" ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <><Play className="h-4 w-4" /> İşe başla</>
            )}
          </button>
          <ProblemButton loading={loading === "report"} onReport={(b) => call("report", b)} />
          <CancelButton loading={loading === "cancel"} onCancel={(r) => call("cancel", { reason: r })} />
        </div>
      )}

      {status === "IN_PROGRESS" && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
            <Play className="mt-0.5 h-4 w-4 shrink-0" /> İş devam ediyor. Bitince "İşi tamamladım" ile teslim et.
          </div>
          <div className="rounded-xl border border-navy-100 p-4">
            <label className="mb-1 block text-sm font-medium text-navy-700">Teslim notu (opsiyonel)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              className="input resize-none" placeholder="Yapılan işi kısaca özetle..." />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <FileUpload accept="image/*,application/pdf" label="Foto/belge ekle"
                onUploaded={(url) => setFiles((f) => [...f, url])} />
              {files.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-navy-100 px-2 py-0.5 text-xs text-navy-600">
                  <a href={f} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-navy-900">
                    <FileText className="h-3 w-3" /> Dosya {i + 1}
                  </a>
                  <button onClick={() => setFiles((arr) => arr.filter((_, j) => j !== i))}
                    className="ml-1 text-navy-400 hover:text-red-600">×</button>
                </span>
              ))}
            </div>
            <button onClick={() => call("deliver", { note: note || undefined, files }, "İşi tamamladın olarak işaretle?")}
              disabled={loading !== null} className="btn-primary mt-3 w-full">
              {loading === "deliver" ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <><CheckCircle2 className="h-4 w-4" /> İşi tamamladım</>
              )}
            </button>
          </div>
          <ProblemButton loading={loading === "report"} onReport={(b) => call("report", b)} />
        </div>
      )}

      {status === "DELIVERED" && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" /> İşi teslim ettin. Müşterinin onayı bekleniyor.
          </div>
          {delivery?.note && (
            <p className="rounded-xl bg-navy-50/50 p-3 text-sm text-navy-600">{delivery.note}</p>
          )}
          <ProblemButton loading={loading === "report"} onReport={(b) => call("report", b)} />
        </div>
      )}

      {status === "COMPLETED" && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            <PartyPopper className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="font-semibold">Tebrikler! İş onaylandı ve tamamlandı olarak kaydedildi.</p>
          </div>
          {review && <ProviderReviewReply review={review} />}
        </div>
      )}

      {status === "PROBLEM_REPORTED" && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Sorun bildirildi — ekibimiz inceliyor.</p>
          </div>
        </div>
      )}

      {status === "CANCELLED" && (
        <div className="flex items-start gap-2 rounded-xl bg-navy-50 p-4 text-sm text-navy-600">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" /> Bu iş iptal edildi.
        </div>
      )}
    </div>
  );
}

function ProviderReviewReply({ review }: { review: NonNullable<ReviewInfo> }) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");

  async function sendReply() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${review.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Yanıt gönderilemedi."); return; }
      router.refresh();
    } catch { setError("Sunucuya ulaşılamadı."); } finally { setLoading(false); }
  }

  async function report() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason }),
      });
      if (res.ok) { setReporting(false); router.refresh(); }
    } finally { setLoading(false); }
  }

  return (
    <div className="rounded-xl border border-navy-100 p-4">
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 fill-gold-400 text-gold-400" />
        <span className="font-semibold text-navy-900">{review.rating}/5</span>
        <span className="text-xs text-navy-400">müşteri değerlendirmesi</span>
      </div>
      {review.comment && (
        <p className="mt-2 whitespace-pre-line text-sm text-navy-600">{review.comment}</p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {review.providerReply ? (
        <div className="mt-3 rounded-lg bg-navy-50 p-3 text-sm">
          <p className="text-xs font-semibold text-navy-700">Yanıtın</p>
          <p className="mt-1 whitespace-pre-line text-navy-600">{review.providerReply}</p>
        </div>
      ) : (
        <div className="mt-3">
          <div className="flex items-center gap-1 text-xs font-medium text-navy-700">
            <MessageSquare className="h-3.5 w-3.5" /> Yoruma yanıt ver (tek sefer)
          </div>
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2}
            className="input mt-1 resize-none" placeholder="Kibar ve profesyonel bir yanıt yaz..." />
          <button onClick={sendReply} disabled={loading || reply.trim().length < 2}
            className="btn-primary mt-2 text-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Send className="h-4 w-4" /> Yanıtla</>)}
          </button>
        </div>
      )}

      {/* Haksız yorum şikayeti */}
      {!reporting ? (
        <button onClick={() => setReporting(true)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-navy-400 hover:text-red-600">
          <AlertTriangle className="h-3.5 w-3.5" /> Bu yorumu şikayet et
        </button>
      ) : (
        <div className="mt-3 rounded-lg border border-red-100 bg-red-50/50 p-3">
          <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} rows={2}
            className="input resize-none" placeholder="Neden haksız/uygunsuz? (en az 5 karakter)" />
          <div className="mt-2 flex gap-2">
            <button onClick={report} disabled={loading || reportReason.trim().length < 5}
              className="btn-primary text-sm">Şikayet et</button>
            <button onClick={() => setReporting(false)} className="btn-ghost text-sm">Vazgeç</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProblemButton({ loading, onReport }: { loading: boolean; onReport: (b: unknown) => void }) {
  const [show, setShow] = useState(false);
  const [type, setType] = useState("OTHER");
  const [desc, setDesc] = useState("");
  const [media, setMedia] = useState<string[]>([]);

  if (!show)
    return (
      <button onClick={() => setShow(true)}
        className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700">
        <AlertTriangle className="h-4 w-4" /> Sorun bildir
      </button>
    );

  return (
    <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
      <label className="mb-1 block text-sm font-medium text-navy-700">Sorun türü</label>
      <select value={type} onChange={(e) => setType(e.target.value)} className="input mb-2">
        {Object.entries(PROBLEM_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
        className="input resize-none" placeholder="Sorunu detaylıca anlat (en az 10 karakter)..." />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <FileUpload accept="image/*,video/*" label="Foto/video ekle" onUploaded={(u) => setMedia((m) => [...m, u])} />
        {media.map((_, i) => (
          <span key={i} className="rounded-full bg-navy-100 px-2 py-0.5 text-xs text-navy-600">Dosya {i + 1}</span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <button onClick={() => onReport({ type, description: desc, media })}
          disabled={loading || desc.trim().length < 10} className="btn-primary text-sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gönder"}
        </button>
        <button onClick={() => setShow(false)} className="btn-ghost text-sm">Vazgeç</button>
      </div>
    </div>
  );
}

function CancelButton({ loading, onCancel }: { loading: boolean; onCancel: (reason: string) => void }) {
  const [show, setShow] = useState(false);
  const [reason, setReason] = useState("");
  if (!show)
    return (
      <button onClick={() => setShow(true)}
        className="inline-flex items-center gap-1 text-sm font-medium text-navy-400 hover:text-navy-700">
        <XCircle className="h-4 w-4" /> İptal et
      </button>
    );
  return (
    <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-4">
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2}
        className="input resize-none" placeholder="İptal nedeni (en az 5 karakter)..." />
      <div className="mt-2 flex gap-2">
        <button onClick={() => onCancel(reason)} disabled={loading || reason.trim().length < 5}
          className="btn-primary text-sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "İptal et"}
        </button>
        <button onClick={() => setShow(false)} className="btn-ghost text-sm">Vazgeç</button>
      </div>
    </div>
  );
}
