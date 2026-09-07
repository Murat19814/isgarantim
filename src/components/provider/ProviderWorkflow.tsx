"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Loader2, CheckCircle2, Clock, Wallet, FileText,
  Phone, Mail, Lock, PartyPopper, Gavel, Upload, AlertTriangle,
} from "lucide-react";
import { formatTRY } from "@/lib/utils";

type Delivery = {
  note: string | null;
  files: string[];
  deliveredAt: string | null;
  approvedAt: string | null;
} | null;

export function ProviderWorkflow({
  requestId,
  status,
  amount,
  platformFee,
  providerPayout,
  approvalDeadline,
  delivery,
  customer,
  contactUnlocked,
  disputeReason,
}: {
  requestId: string;
  status: string;
  amount: number;
  platformFee: number;
  providerPayout: number;
  approvalDeadline: string | null;
  delivery: Delivery;
  customer: { fullName: string; phone: string | null; email: string | null } | null;
  contactUnlocked: boolean;
  disputeReason: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeText, setDisputeText] = useState("");

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
      setShowDispute(false);
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(null);
    }
  }

  function addFile() {
    const url = window.prompt("Foto/belge URL'si yapıştır:");
    if (url && /^https?:\/\//.test(url)) setFiles((f) => [...f, url]);
  }

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-emerald-600" />
        <h2 className="font-display text-lg font-bold text-navy-900">İş süreci</h2>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
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
                <Lock className="h-4 w-4" /> Müşteri ödeme yapınca iletişim açılır
              </p>
            )}
          </div>
        </div>
      )}

      {/* Kazanç özeti */}
      <div className="mb-4 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-xl bg-navy-50/50 p-3">
          <p className="text-xs text-navy-400">İş ücreti</p>
          <p className="font-bold text-navy-900">{formatTRY(amount)}</p>
        </div>
        <div className="rounded-xl bg-navy-50/50 p-3">
          <p className="text-xs text-navy-400">Komisyon</p>
          <p className="font-bold text-navy-900">−{formatTRY(platformFee)}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-xs text-emerald-600">Sana kalan</p>
          <p className="font-bold text-emerald-700">{formatTRY(providerPayout)}</p>
        </div>
      </div>

      {status === "OFFER_SELECTED" && (
        <div className="flex items-start gap-2 rounded-xl bg-gold-50 p-3 text-sm text-navy-700">
          <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
          Teklifin kabul edildi! Müşteri ödemeyi emanete alınca işe başlayabilirsin.
        </div>
      )}

      {status === "IN_ESCROW" && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            Ödeme emanete alındı. İş bitince "İşi tamamladım" ile teslim et.
          </div>

          <div className="rounded-xl border border-navy-100 p-4">
            <label className="mb-1 block text-sm font-medium text-navy-700">
              Teslim notu (opsiyonel)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="Yapılan işi kısaca özetle..."
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button onClick={addFile} className="btn-outline text-sm">
                <Upload className="h-4 w-4" /> Foto/belge ekle
              </button>
              {files.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-navy-100 px-2 py-0.5 text-xs text-navy-600">
                  <FileText className="h-3 w-3" /> Dosya {i + 1}
                  <button
                    onClick={() => setFiles((arr) => arr.filter((_, j) => j !== i))}
                    className="ml-1 text-navy-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button
              onClick={() =>
                call("deliver", { note: note || undefined, files }, "İşi tamamladın olarak işaretlemek istiyor musun?")
              }
              disabled={loading !== null}
              className="btn-primary mt-3 w-full"
            >
              {loading === "deliver" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> İşi tamamladım
                </>
              )}
            </button>
          </div>

          <DisputeSection
            show={showDispute}
            setShow={setShowDispute}
            text={disputeText}
            setText={setDisputeText}
            loading={loading === "dispute"}
            onSubmit={() => call("dispute", { reason: disputeText })}
          />
        </div>
      )}

      {status === "DELIVERED" && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            İşi teslim ettin. Müşterinin onayı bekleniyor
            {approvalDeadline
              ? ` (son ${new Date(approvalDeadline).toLocaleDateString("tr-TR")}).`
              : "."}
          </div>
          {delivery?.note && (
            <p className="rounded-xl bg-navy-50/50 p-3 text-sm text-navy-600">
              {delivery.note}
            </p>
          )}
        </div>
      )}

      {status === "COMPLETED" && (
        <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          <PartyPopper className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">
              Tebrikler! İş onaylandı, {formatTRY(providerPayout)} hesabına aktarıldı.
            </p>
          </div>
        </div>
      )}

      {status === "DISPUTED" && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <Gavel className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">İtiraz açık — ödeme durduruldu.</p>
            {disputeReason && <p className="mt-1">Neden: {disputeReason}</p>}
            <p className="mt-1 text-red-600">Ekibimiz inceliyor.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function DisputeSection({
  show,
  setShow,
  text,
  setText,
  loading,
  onSubmit,
}: {
  show: boolean;
  setShow: (v: boolean) => void;
  text: string;
  setText: (v: string) => void;
  loading: boolean;
  onSubmit: () => void;
}) {
  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
      >
        <AlertTriangle className="h-4 w-4" /> Sorun mu var? İtiraz aç
      </button>
    );
  }
  return (
    <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
      <label className="mb-1 block text-sm font-medium text-navy-700">
        İtiraz nedenin
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="input resize-none"
        placeholder="Yaşadığın sorunu detaylıca anlat (en az 10 karakter)..."
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={onSubmit}
          disabled={loading || text.trim().length < 10}
          className="btn-primary text-sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "İtirazı gönder"}
        </button>
        <button onClick={() => setShow(false)} className="btn-ghost text-sm">
          Vazgeç
        </button>
      </div>
    </div>
  );
}
