"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet, Lock, Plus, Loader2, MapPin, Users, Coins, X,
} from "lucide-react";
import { formatTRY } from "@/lib/utils";
import { DEFAULT_OFFER_CREDIT_COST } from "@/lib/constants";

type OpenRequest = {
  id: string;
  title: string;
  city: string;
  district: string | null;
  categoryName: string;
  offerCount: number;
  budgetMin: number | null;
  budgetMax: number | null;
};

const CREDIT_PACKAGES = [500, 1000, 2500, 5000];

export function ProviderDashboard({
  initialBalance,
  initialHeld,
  requests,
}: {
  initialBalance: number;
  initialHeld: number;
  requests: OpenRequest[];
}) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance);
  const [held, setHeld] = useState(initialHeld);
  const [buying, setBuying] = useState<number | null>(null);
  const [offerFor, setOfferFor] = useState<string | null>(null);

  async function buy(amount: number) {
    setBuying(amount);
    try {
      const res = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (res.ok) setBalance(data.balance);
    } finally {
      setBuying(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Kontör kartı */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center gap-2 text-sm text-navy-500">
            <Wallet className="h-4 w-4 text-emerald-600" /> Kullanılabilir kontör
          </div>
          <p className="mt-2 font-display text-4xl font-extrabold text-navy-900">
            {balance.toLocaleString("tr-TR")}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-navy-400">
            <Lock className="h-3 w-3" /> Beklemede: {held.toLocaleString("tr-TR")} kontör
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 text-sm text-navy-500">
            <Coins className="h-4 w-4 text-gold-500" /> Kontör yükle
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {CREDIT_PACKAGES.map((amt) => (
              <button
                key={amt}
                onClick={() => buy(amt)}
                disabled={buying !== null}
                className="btn-outline text-sm"
              >
                {buying === amt ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `+${amt.toLocaleString("tr-TR")}`
                )}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-navy-400">
            Test modu — gerçek ödeme Faz 4'te. Her teklif {DEFAULT_OFFER_CREDIT_COST} kontör.
          </p>
        </div>
      </div>

      {/* Açık talepler */}
      <div>
        <h2 className="mb-4 font-display text-xl font-bold text-navy-900">
          Açık hizmet talepleri ({requests.length})
        </h2>
        {requests.length === 0 ? (
          <div className="card p-8 text-center text-navy-500">
            Şu an açık talep yok. Yeni talepler geldiğinde burada görünecek.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="badge-navy">{r.categoryName}</span>
                    <p className="mt-1 truncate font-semibold text-navy-900">{r.title}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-400">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {r.city}
                        {r.district ? ` / ${r.district}` : ""}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {r.offerCount} teklif
                      </span>
                      {(r.budgetMin || r.budgetMax) && (
                        <span className="inline-flex items-center gap-1">
                          <Wallet className="h-3.5 w-3.5" />
                          {r.budgetMin ? formatTRY(r.budgetMin) : "?"} -{" "}
                          {r.budgetMax ? formatTRY(r.budgetMax) : "?"}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setOfferFor(offerFor === r.id ? null : r.id)}
                    className="btn-primary shrink-0 text-sm"
                  >
                    {offerFor === r.id ? (
                      <>
                        <X className="h-4 w-4" /> Kapat
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> Teklif ver
                      </>
                    )}
                  </button>
                </div>

                {offerFor === r.id && (
                  <OfferForm
                    requestId={r.id}
                    balance={balance}
                    onSuccess={() => {
                      setOfferFor(null);
                      setBalance((b) => b - DEFAULT_OFFER_CREDIT_COST);
                      setHeld((h) => h + DEFAULT_OFFER_CREDIT_COST);
                      router.refresh();
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OfferForm({
  requestId,
  balance,
  onSuccess,
}: {
  requestId: string;
  balance: number;
  onSuccess: () => void;
}) {
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insufficient = balance < DEFAULT_OFFER_CREDIT_COST;

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/service-requests/${requestId}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Number(price),
          estimatedDuration: duration,
          message: message || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Teklif verilemedi.");
        return;
      }
      onSuccess();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-navy-100 bg-navy-50/50 p-4">
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {insufficient && (
        <div className="mb-3 rounded-lg bg-gold-50 px-3 py-2 text-sm text-navy-700">
          Yetersiz kontör. Teklif için {DEFAULT_OFFER_CREDIT_COST} kontör gerekli.
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">
            Fiyatın (₺)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input"
            placeholder="2500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-navy-700">
            Tahmini süre
          </label>
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="input"
            placeholder="2 gün"
          />
        </div>
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-navy-700">
          Mesaj (opsiyonel)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className="input resize-none"
          placeholder="Deneyimini ve işe yaklaşımını kısaca yaz..."
        />
      </div>
      <button
        onClick={submit}
        disabled={loading || insufficient || !price || !duration}
        className="btn-primary mt-3 w-full"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Teklifi gönder ({DEFAULT_OFFER_CREDIT_COST} kontör beklemeye alınır)
      </button>
    </div>
  );
}
