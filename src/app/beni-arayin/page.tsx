import { Phone, Headphones, Clock, UserCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CallbackForm } from "@/components/CallbackForm";

export const metadata = {
  title: "Beni Arayın",
  description: "Talebini nasıl oluşturacağını bilmiyorsan bırak numaranı, ekibimiz seni arasın.",
};

const POINTS = [
  { icon: Headphones, title: "Birlikte oluşturalım", desc: "Ne istediğini anlat, talebini biz oluşturalım." },
  { icon: UserCheck, title: "Yakının adına da olur", desc: "Anne, baba veya bir yakının için de talep açabilirsin." },
  { icon: Clock, title: "Hızlı dönüş", desc: "Ekibimiz en kısa sürede seni arar." },
];

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="container-page py-10">
        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              <Phone className="h-4 w-4" /> Çağrı merkezi
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-navy-900">
              Beni arayın, talebinizi birlikte oluşturalım
            </h1>
            <p className="mt-3 text-navy-500">
              Uygulamayı kullanmakta zorlanıyorsan ya da işini telefonda anlatmak
              istiyorsan, numaranı bırak; ekibimiz seni arasın ve talebini birlikte
              oluşturalım.
            </p>
            <div className="mt-6 space-y-4">
              {POINTS.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-100 text-navy-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-navy-900">{p.title}</h3>
                      <p className="text-sm text-navy-500">{p.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <CallbackForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
