"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Loader2, CheckCircle2, AlertTriangle, Clock, Wallet,
  FileText, Phone, Mail, Lock, PartyPopper, Gavel,
} from "lucide-react";
import { formatTRY } from "@/lib/utils";

type Delivery = {
  note: string | null;
  files: string[];
  deliveredAt: string | null;
  approvedAt: string | null;
} | null;

type Contact = {
  fullName: string;
  phone: string | null;
  email: string | null;
  headline?: string | null;
};

export function EscrowWorkflow({
  requestId,
  status,
  amount,
  platformFee,
  approvalDeadline,
  delivery,
  provider,
  contactUnlocked,
  disputeReason,
}: {
  requestId: string;
  status: string;
  amount: number;
  platformFee: number;
  approvalDeadline: string | null;
  delivery: Delivery;
  provider: Contact | null;
  contactUnlocked: boolean;
  disputeReason: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-emerald-600" />
        <h2 className="font-display text-lg font-bold text-navy-900">
          Emanet & iş süreci
        </h2>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Kazanan hizmet veren + iletişim */}
      {provider && (
        <div className="mb-4 rounded-xl border border-navy-100 bg-navy-50/50 p-4">
          <p className="text-xs text-navy-400">Seçilen hizmet veren</p>
          <p className="font-semibold text-navy-900">{provider.fullName}</p>
          {provider.headline && (
            <p className="text-xs text-navy-400">{provider.headline}</p>
          )}
          <div className="mt-2 space-y-1 text-sm">
            {contactUnlocked ? (
              <>
                <p className="inline-flex items-center gap-1.5 text-navy-700">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  {provider.phone ?? "—"}
                </p>
                <p className="inline-flex items-center gap-1.5 text-navy-700">
                  <Mail className="h-4 w-4 text-emerald-600" /> {provider.email ?? "—"}
                </p>
              </>
            ) : (
              <p className="inline-flex items-center gap-1.5 text-navy-400">
                <Lock className="h-4 w-4" /> İletişim bilgileri ödeme sonrası açılır
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tutar özeti */}
      <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-navy-50/50 p-3">
          <p className="text-xs text-navy-400">İş ücreti</p>
          <p className="font-display text-lg font-bold text-navy-900">
            {formatTRY(amount)}
          </p>
        </div>
        <div className="rounded-xl bg-navy-50/50 p-3">
          <p className="text-xs text-navy-400">Platform komisyonu</p>
          <p className="font-display text-lg font-bold text-navy-900">
            {formatTRY(platformFee)}
          </p>
        </div>
      </div>

      {/* Duruma göre aksiyon */}
      {status === "OFFER_SELECTED" && (
        <div>
          <div className="mb-3 flex items-start gap-2 rounded-xl bg-gold-50 p-3 text-sm text-navy-700">
            <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
            Ödemeni yap; tutar <b>güvenli emanette</b> bekletilir. İş tamamlanıp
            onaylayana kadar hizmet verene aktarılmaz.
          </div>
          <button
            onClick={() =>
              call("pay", undefined, `${formatTRY(amount)} tutarı emanete alınacak. Onaylıyor musun?`)
            }
            disabled={loading !== null}
            className="btn-primary w-full"
          >
            {loading === "pay" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" /> Ödemeyi yap (emanet)
              </>
            )}
          </button>
          <p className="mt-2 text-center text-xs text-navy-400">
            Test modu — gerçek ödeme entegrasyonu (iyzico/PayTR) sonra bağlanacak.
          </p>
        </div>
      )}

      {status === "IN_ESCROW" && (
        <div>
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            Ödeme emanette. Hizmet verenin işi tamamlamasını bekliyorsun. Bir
            sorun olursa itiraz açabilirsin.
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
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <p className="flex items-center gap-2 font-semibold text-emerald-800">
              <FileText className="h-4 w-4" /> Hizmet veren işi tamamladı
            </p>
            {delivery?.note && (
              <p className="mt-2 whitespace-pre-line text-sm text-navy-700">
                {delivery.note}
              </p>
            )}
            {delivery?.files && delivery.files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {delivery.files.map((f, i) => (
                  <a
                    key={i}
                    href={f}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs text-emerald-700 underline"
                  >
                    <FileText className="h-3.5 w-3.5" /> Dosya {i + 1}
                  </a>
                ))}
              </div>
            )}
            {approvalDeadline && (
              <p className="mt-3 inline-flex items-center gap-1 text-xs text-navy-500">
                <Clock className="h-3.5 w-3.5" /> Onay için son tarih:{" "}
                {new Date(approvalDeadline).toLocaleDateString("tr-TR")}
              </p>
            )}
          </div>

          <button
            onClick={() =>
              call("approve", undefined, "İşi onaylıyorsun. Ödeme hizmet verene aktarılacak. Emin misin?")
            }
            disabled={loading !== null}
            className="btn-primary w-full"
          >
            {loading === "approve" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Onayla ve ödemeyi serbest bırak
              </>
            )}
          </button>

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

      {status === "COMPLETED" && (
        <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          <PartyPopper className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">İş tamamlandı ve ödeme aktarıldı.</p>
            <p className="mt-1 text-emerald-700">
              Hizmet verene teşekkür etmeyi ve değerlendirme bırakmayı unutma.
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
            <p className="mt-1 text-red-600">
              Ekibimiz inceleyip en kısa sürede çözüme kavuşturacak.
            </p>
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
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
      >
        <AlertTriangle className="h-4 w-4" /> Bir sorun mu var? İtiraz aç
      </button>
    );
  }
  return (
    <div className="mt-3 rounded-xl border border-red-100 bg-red-50/50 p-4">
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
