import { Smartphone, Apple, Play } from "lucide-react";

export function CtaMobile() {
  return (
    <section className="container-page py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-3xl bg-navy-900 bg-hero-radial p-8 text-white sm:p-12">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <span className="badge bg-gold-400/15 text-gold-300 ring-1 ring-gold-400/30">
              <Smartphone className="h-3.5 w-3.5" /> Mobil uygulama
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
              İşKalkan cebinde
            </h2>
            <p className="mt-3 max-w-md text-navy-100">
              Hizmet talebi oluştur, teklif ver, mesajlaş, öde ve iş ilanlarına
              başvur — hepsi tek uygulamada. Android ve iOS için yakında.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn bg-white text-navy-900 hover:bg-navy-50">
                <Apple className="h-5 w-5" /> App Store
              </button>
              <button className="btn bg-white text-navy-900 hover:bg-navy-50">
                <Play className="h-5 w-5" /> Google Play
              </button>
            </div>
          </div>

          <div className="relative hidden justify-end lg:flex">
            <div className="grid h-56 w-full max-w-sm place-items-center rounded-3xl border border-white/10 bg-white/5">
              <div className="text-center">
                <Smartphone className="mx-auto h-16 w-16 text-gold-400" />
                <p className="mt-3 text-sm text-navy-200">
                  React Native + Expo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
