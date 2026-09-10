import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";

export function CallbackCta() {
  return (
    <section className="container-page py-8">
      <div className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-navy-900 to-navy-700 p-6 text-center text-white sm:flex-row sm:text-left">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-gold-400">
            <Phone className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-display text-lg font-extrabold">
              Nasıl yapacağını bilmiyor musun? Beni arayın.
            </h3>
            <p className="text-sm text-navy-100">
              Numaranı bırak, ekibimiz seni arasın ve talebini birlikte oluşturalım.
              Yakının adına da açabilirsin.
            </p>
          </div>
        </div>
        <Link href="/beni-arayin" className="btn-gold inline-flex shrink-0 items-center gap-2">
          Beni arayın <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
