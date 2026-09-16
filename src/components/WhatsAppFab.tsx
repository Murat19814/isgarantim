import { MessageCircle } from "lucide-react";
import { LEGAL } from "@/lib/constants";

/** Sabit (yüzen) WhatsApp butonu — her sayfada sağ altta. */
export function WhatsAppFab() {
  const text = encodeURIComponent(
    "Merhaba, İşGarantim (isgarantim.com) hakkında bilgi almak istiyorum.",
  );
  return (
    <a
      href={`https://wa.me/${LEGAL.whatsappNumber}?text=${text}`}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp ile yaz"
      className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
