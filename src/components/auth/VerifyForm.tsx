"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail, Smartphone, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Channel = "EMAIL" | "PHONE";

export function VerifyForm() {
  const params = useSearchParams();
  const userId = params.get("userId") ?? "";
  const [verified, setVerified] = useState<Record<Channel, boolean>>({
    EMAIL: false,
    PHONE: false,
  });

  const allDone = verified.EMAIL && verified.PHONE;

  if (!userId) {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        Geçersiz bağlantı. Lütfen tekrar kayıt ol.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChannelBlock
        channel="EMAIL"
        userId={userId}
        label="E-posta doğrulama"
        icon={<Mail className="h-4 w-4" />}
        done={verified.EMAIL}
        onDone={() => setVerified((v) => ({ ...v, EMAIL: true }))}
      />
      <ChannelBlock
        channel="PHONE"
        userId={userId}
        label="Telefon doğrulama"
        icon={<Smartphone className="h-4 w-4" />}
        done={verified.PHONE}
        onDone={() => setVerified((v) => ({ ...v, PHONE: true }))}
      />

      {allDone ? (
        <Link href="/giris" className="btn-primary w-full">
          Doğrulandı — Giriş yap
        </Link>
      ) : (
        <p className="text-center text-xs text-navy-400">
          İpucu: Geliştirme modunda kodlar terminaldeki (sunucu) konsola yazılır.
        </p>
      )}
    </div>
  );
}

function ChannelBlock({
  channel,
  userId,
  label,
  icon,
  done,
  onDone,
}: {
  channel: Channel;
  userId: string;
  label: string;
  icon: React.ReactNode;
  done: boolean;
  onDone: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function verify() {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, channel, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Doğrulanamadı.");
        return;
      }
      onDone();
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setResending(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, channel }),
      });
      if (res.ok) setInfo("Yeni kod gönderildi.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        done ? "border-emerald-200 bg-emerald-50" : "border-navy-100 bg-white",
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-navy-800">
        {done ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        ) : (
          icon
        )}
        {label}
        {done && <span className="text-xs text-emerald-600">· Doğrulandı</span>}
      </div>

      {!done && (
        <>
          <div className="mt-3 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              placeholder="6 haneli kod"
              className="input tracking-widest"
            />
            <button
              type="button"
              onClick={verify}
              disabled={loading || code.length !== 6}
              className="btn-navy shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Onayla"}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          {info && <p className="mt-2 text-xs text-emerald-600">{info}</p>}
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="mt-2 text-xs font-medium text-emerald-600 hover:underline"
          >
            {resending ? "Gönderiliyor..." : "Kodu yeniden gönder"}
          </button>
        </>
      )}
    </div>
  );
}
