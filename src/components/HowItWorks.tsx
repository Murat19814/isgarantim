import { FileText, Users, UserCheck, CalendarCheck } from "lucide-react";

const STEPS = [
  {
    icon: FileText,
    title: "1. Talebini oluştur",
    desc: "Kategori, konum, açıklama ve fotoğrafla ihtiyacını dakikalar içinde anlat.",
  },
  {
    icon: Users,
    title: "2. Teklifleri karşılaştır",
    desc: "Fiyat, puan, yorum, tamamlanan iş ve doğrulanmış profile göre ustaları kıyasla.",
  },
  {
    icon: UserCheck,
    title: "3. Hizmet vereni seç",
    desc: "Sana en uygun kişiyi seç, platform üzerinden mesajlaşarak detayları netleştir.",
  },
  {
    icon: CalendarCheck,
    title: "4. Randevunu oluştur ve değerlendir",
    desc: "Randevu tarihini belirle, iş tamamlanınca deneyimini puanla ve yorum bırak.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-navy-50/60 py-16 sm:py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">Nasıl çalışır?</h2>
          <p className="section-subtitle mx-auto">
            Dört basit adımda doğru kişiyi güvenle bul.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="relative card p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-emerald-600 shadow-soft ring-1 ring-emerald-100">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
