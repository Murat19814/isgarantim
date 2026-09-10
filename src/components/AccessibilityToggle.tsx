"use client";

import { useEffect, useState } from "react";
import { Accessibility } from "lucide-react";
import { cn } from "@/lib/utils";

const KEY = "isk-a11y-large";

/** Yaşlı / görme kolaylığı modu: büyük yazı. Tercih localStorage'da saklanır. */
export function AccessibilityToggle() {
  const [large, setLarge] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const on = localStorage.getItem(KEY) === "1";
    setLarge(on);
    document.documentElement.classList.toggle("a11y-large", on);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !large;
    setLarge(next);
    document.documentElement.classList.toggle("a11y-large", next);
    localStorage.setItem(KEY, next ? "1" : "0");
  }

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      aria-pressed={large}
      title="Büyük yazı modu (yaşlı/görme kolaylığı)"
      className={cn(
        "fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-lg transition-colors",
        large
          ? "border-emerald-500 bg-emerald-600 text-white"
          : "border-navy-200 bg-white text-navy-700 hover:border-navy-300",
      )}
    >
      <Accessibility className="h-5 w-5" />
      <span className="hidden sm:inline">{large ? "Normal yazı" : "Büyük yazı"}</span>
    </button>
  );
}
