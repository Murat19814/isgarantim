"use client";

import { Download } from "lucide-react";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-primary text-sm">
      <Download className="h-4 w-4" /> PDF olarak indir / yazdır
    </button>
  );
}
