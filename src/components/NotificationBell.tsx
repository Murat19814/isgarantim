"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  const d = Math.floor(h / 24);
  return `${d} gün önce`;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items ?? []);
      setUnread(data.unread ?? 0);
    } catch {
      /* sessizce geç */
    }
  }, []);

  // İlk yükleme + 30 sn'de bir yokla
  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function markAll() {
    setLoading(true);
    try {
      await fetch("/api/notifications/read", { method: "POST" });
      setItems((xs) => xs.map((x) => ({ ...x, isRead: true })));
      setUnread(0);
    } finally {
      setLoading(false);
    }
  }

  async function openItem(item: Item) {
    setOpen(false);
    if (!item.isRead) {
      fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      }).catch(() => {});
    }
    if (item.link) router.push(item.link);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-9 w-9 place-items-center rounded-xl text-navy-600 hover:bg-navy-50"
        aria-label="Bildirimler"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
            <p className="text-sm font-bold text-navy-900">Bildirimler</p>
            {unread > 0 && (
              <button
                onClick={markAll}
                disabled={loading}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Tümünü okundu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-navy-400">
                Henüz bildirim yok.
              </p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openItem(item)}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 border-b border-navy-50 px-4 py-3 text-left hover:bg-navy-50/60",
                    !item.isRead && "bg-emerald-50/40",
                  )}
                >
                  <div className="flex w-full items-center gap-2">
                    {!item.isRead && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    )}
                    <span className="flex-1 text-sm font-semibold text-navy-900">
                      {item.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-navy-400">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                  {item.body && (
                    <span className="line-clamp-2 text-xs text-navy-500">{item.body}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
