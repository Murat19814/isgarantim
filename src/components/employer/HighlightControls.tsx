"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function HighlightControls({
  postingId,
  featured,
  urgent,
  featuredEnabled,
  urgentEnabled,
}: {
  postingId: string;
  featured: boolean;
  urgent: boolean;
  featuredEnabled: boolean;
  urgentEnabled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: { featured?: boolean; urgent?: boolean }, key: string) {
    setLoading(key);
    setError(null);
    try {
      const res = await fetch(`/api/job-postings/${postingId}/highlight`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "İşlem başarısız.");
      else router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="card p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
        <Sparkles className="h-5 w-5 text-gold-500" /> İlanı öne çıkar
      </h2>
      <p className="mt-1 text-sm text-navy-500">
        İlanını listelerde üst sıraya taşı veya "Acil" rozeti ekle; daha çok adaya ulaş.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-3">
        {featuredEnabled && (
          <button
            onClick={() => patch({ featured: !featured }, "featured")}
            disabled={loading !== null}
            className={cn("inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
              featured ? "border-gold-400 bg-gold-50 text-gold-700" : "border-navy-200 text-navy-700 hover:border-navy-300")}
          >
            {loading === "featured" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className={cn("h-4 w-4", featured && "fill-gold-400")} />}
            {featured ? "Öne çıkarma açık" : "Öne çıkar"}
          </button>
        )}
        {urgentEnabled && (
          <button
            onClick={() => patch({ urgent: !urgent }, "urgent")}
            disabled={loading !== null}
            className={cn("inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
              urgent ? "border-red-300 bg-red-50 text-red-700" : "border-navy-200 text-navy-700 hover:border-navy-300")}
          >
            {loading === "urgent" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className={cn("h-4 w-4", urgent && "fill-red-400")} />}
            {urgent ? "Acil rozeti açık" : "Acil işaretle"}
          </button>
        )}
      </div>
    </div>
  );
}
