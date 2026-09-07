import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

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
    default: "İşKalkan — İşin de ödemen de güvende",
    template: "%s | İşKalkan",
  },
  description:
    "İşKalkan (isgarantim.com): Doğrulanmış ustalardan güvenle hizmet al, hizmet ver, iş ara veya iş ilanı yayınla. Ödemen iş tamamlanana kadar platformda güvende.",
  keywords: [
    "hizmet",
    "usta",
    "iş ilanı",
    "iş ara",
    "tadilat",
    "temizlik",
    "güvenli ödeme",
    "isgarantim",
  ],
  metadataBase: new URL("https://isgarantim.com"),
  openGraph: {
    title: "İşKalkan — İşin de ödemen de güvende",
    description:
      "Doğrulanmış ustalardan güvenle hizmet al, iş ara veya iş ilanı yayınla.",
    url: "https://isgarantim.com",
    siteName: "İşKalkan",
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
      </body>
    </html>
  );
}
