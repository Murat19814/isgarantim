import Link from "next/link";
import { KeyRound, Droplets, Zap, Flame, Square, Car, Siren, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { EMERGENCY_TYPES } from "@/lib/constants";

export const metadata = {
  title: "Acil Yardım",
  description: "Çilingir, su kaçağı, elektrik arızası ve daha fazlası için hızlı yardım.",
};

const ICONS: Record<string, typeof KeyRound> = {
  KeyRound, Droplets, Zap, Flame, Square, Car,
};

export default async function Page() {
  // Acil tipini ilgili hizmet kategorisine bağla (varsa) — wizard'a category geçmek için.
  const cats = await prisma.serviceCategory.findMany({
    where: { parentId: null, isActive: true },
    select: { id: true, slug: true },
  });
  const slugToId = new Map(cats.map((c) => [c.slug, c.id]));

  return (
    <>
      <Navbar />
      <main className="container-page py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl bg-gradient-to-br from-red-600 to-red-500 p-8 text-center text-white">
            <Siren className="mx-auto h-10 w-10" />
            <h1 className="mt-3 font-display text-3xl font-extrabold">Acil Yardım</h1>
            <p className="mt-2 text-red-50">
              Bir sorun mu var? İhtiyacını seç; talebin bölgendeki aynı gün müsait ustalara anında iletilsin.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {EMERGENCY_TYPES.map((t) => {
              const Icon = ICONS[t.icon] ?? Siren;
              const catId = slugToId.get(t.matchSlug);
              const href =
                `/panel/hizmet-al/yeni?emergency=1&urgency=URGENT` +
                `&title=${encodeURIComponent("Acil: " + t.label)}` +
                (catId ? `&category=${catId}` : "");
              return (
                <Link
                  key={t.key}
                  href={href}
                  className="group card flex flex-col items-center gap-2 p-5 text-center transition-all hover:-translate-y-1 hover:border-red-300 hover:shadow-card"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="font-semibold text-navy-900">{t.label}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                    Hemen çağır <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>

          <p className="mt-6 rounded-xl bg-navy-50 p-4 text-center text-sm text-navy-500">
            Hayati tehlike, yangın veya sağlık acili durumlarında lütfen önce resmi acil hatları
            (112, 110, 155) arayın. İşKalkan resmi acil servislerin yerine geçmez.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
