import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { AccessibilityToggle } from "@/components/AccessibilityToggle";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "İşGarantim — İşini güvenle bul, ücretsiz teklif al",
    template: "%s | İşGarantim",
  },
  description:
    "İşGarantim (isgarantim.com): İhtiyacını paylaş, teklifleri karşılaştır, doğru kişiyi güvenle bul. Teklif ücreti, kontör ve komisyon olmadan müşterilerle hizmet verenleri buluşturuyoruz.",
  keywords: [
    "hizmet",
    "usta",
    "iş ilanı",
    "iş ara",
    "tadilat",
    "temizlik",
    "ücretsiz teklif",
    "isgarantim",
  ],
  metadataBase: new URL("https://isgarantim.com"),
  openGraph: {
    title: "İşGarantim — İşini güvenle bul, ücretsiz teklif al",
    description:
      "İhtiyacını paylaş, teklifleri karşılaştır, doğru kişiyi güvenle bul. Ücretsiz teklif, kontör ve komisyon yok.",
    url: "https://isgarantim.com",
    siteName: "İşGarantim",
    locale: "tr_TR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1730",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-screen font-sans">
        <SessionProvider>{children}</SessionProvider>
        <AccessibilityToggle />
      </body>
    </html>
  );
}
