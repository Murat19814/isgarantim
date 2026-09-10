"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  providerId,
  initialFavorited,
  canFavorite,
}: {
  providerId: string;
  initialFavorited: boolean;
  canFavorite: boolean;
}) {
  const router = useRouter();
  const [fav, setFav] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!canFavorite) {
      router.push(`/giris?callbackUrl=/hizmet-veren/${providerId}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/favorites/${providerId}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setFav(data.favorited);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
        fav ? "border-red-200 bg-red-50 text-red-600" : "border-navy-200 text-navy-600 hover:border-navy-300",
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn("h-4 w-4", fav && "fill-red-500 text-red-500")} />
      )}
      {fav ? "Favorilerde" : "Favorilere ekle"}
    </button>
  );
}
