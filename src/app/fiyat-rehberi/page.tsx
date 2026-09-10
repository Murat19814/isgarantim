import { TrendingUp, Info } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getPriceGuide } from "@/lib/services/priceGuide";
import { formatTRY } from "@/lib/utils";

export const metadata = {
  title: "Fiyat Rehberi",
  description: "Kategori bazında ortalama hizmet fiyatları.",
};

export default async function Page() {
  const rows = await getPriceGuide();

  return (
    <>
      <Navbar />
      <main className="container-page py-10">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h1 className="flex items-center justify-center gap-2 font-display text-3xl font-extrabold text-navy-900">
              <TrendingUp className="h-7 w-7 text-emerald-600" /> Fiyat Rehberi
            </h1>
            <p className="mt-2 text-navy-500">
              Platformda tamamlanan işlerdeki gerçek anlaşma fiyatlarına göre kategori ortalamaları.
            </p>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-navy-50 p-4 text-sm text-navy-600">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy-400" />
            Fiyatlar yalnızca bilgilendirme amaçlıdır; iş kapsamı, malzeme ve bölgeye göre değişir.
            Kesin fiyat için talep oluşturup teklifleri karşılaştır.
          </div>

          {rows.length === 0 ? (
            <div className="card mt-6 p-10 text-center text-navy-500">
              Henüz yeterli tamamlanmış iş verisi yok. İlk işler tamamlandıkça burası dolacak.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-navy-100">
              <table className="w-full text-sm">
                <thead className="bg-navy-50 text-navy-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Kategori</th>
                    <th className="px-4 py-3 text-right font-semibold">En düşük</th>
                    <th className="px-4 py-3 text-right font-semibold">Ortalama</th>
                    <th className="px-4 py-3 text-right font-semibold">En yüksek</th>
                    <th className="hidden px-4 py-3 text-right font-semibold sm:table-cell">İş sayısı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50">
                  {rows.map((r) => (
                    <tr key={r.categoryId} className="hover:bg-navy-50/40">
                      <td className="px-4 py-3 font-medium text-navy-900">{r.name}</td>
                      <td className="px-4 py-3 text-right text-navy-600">{formatTRY(r.min)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-700">{formatTRY(r.avg)}</td>
                      <td className="px-4 py-3 text-right text-navy-600">{formatTRY(r.max)}</td>
                      <td className="hidden px-4 py-3 text-right text-navy-400 sm:table-cell">{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
