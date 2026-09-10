import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star, CheckCircle2, Clock, MapPin, Briefcase, Repeat, CalendarClock, Award, Zap, RotateCcw,
} from "lucide-react";
import { WEEKDAYS } from "@/lib/validations/profile";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VerificationBadges } from "@/components/VerificationBadges";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getPublicProviderProfile } from "@/lib/services/providerProfile";
import { isFavorited } from "@/lib/services/favorites";
import { auth } from "@/lib/auth/session";
import { REVIEW_CRITERIA } from "@/lib/validations/service";

export const metadata = { title: "Hizmet Veren Profili" };

export default async function Page({ params }: { params: { id: string } }) {
  const data = await getPublicProviderProfile(params.id);
  if (!data) notFound();

  const session = await auth();
  const viewerId = session?.user?.id ?? null;
  const favorited =
    viewerId && viewerId !== params.id ? await isFavorited(viewerId, params.id) : false;

  const { profile, badges, reviews, repeatRate, neighborStats, criteriaAvg } = data;
  const p = profile;

  return (
    <>
      <Navbar />
      <main className="container-page py-8">
        {/* Kapak + kimlik */}
        <div className="overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-soft">
          <div className="h-40 w-full bg-gradient-to-r from-navy-800 to-emerald-700 sm:h-52">
            {p.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.coverUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="relative px-6 pb-6">
            <div className="-mt-10 flex items-end gap-4">
              <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-4 border-white bg-navy-800 font-display text-2xl font-bold text-gold-400">
                {p.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.user.avatarUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                ) : (
                  p.user.fullName.slice(0, 2).toUpperCase()
                )}
              </span>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-extrabold text-navy-900">{p.user.fullName}</h1>
                  {p.user.isFounder && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-gold-700">
                      <Award className="h-3.5 w-3.5" /> Kurucu Üye
                    </span>
                  )}
                </div>
                {p.headline && <p className="text-sm text-navy-500">{p.headline}</p>}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <VerificationBadges badges={badges} size="md" />
              {viewerId !== params.id && (
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/panel/hizmet-al/yeni?provider=${params.id}&providerName=${encodeURIComponent(p.user.fullName)}${p.categories?.[0]?.id ? `&category=${p.categories[0].id}` : ""}`}
                    className="btn-primary text-sm"
                  >
                    <RotateCcw className="h-4 w-4" /> Bu ustadan hizmet al
                  </Link>
                  <FavoriteButton
                    providerId={params.id}
                    initialFavorited={favorited}
                    canFavorite={!!viewerId}
                  />
                </div>
              )}
            </div>
            {neighborStats.total > 0 && neighborStats.topArea && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                <MapPin className="h-4 w-4" />
                Son 30 günde <b>{neighborStats.topArea}</b> bölgesinde {neighborStats.total} doğrulanmış iş tamamladı
              </p>
            )}

            {/* İstatistikler */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard icon={<Star className="h-5 w-5 fill-gold-400 text-gold-400" />}
                value={p.ratingCount > 0 ? `${p.ratingAvg.toFixed(1)}` : "Yeni"}
                label={p.ratingCount > 0 ? `${p.ratingCount} değerlendirme` : "Değerlendirme yok"} />
              <StatCard icon={<Briefcase className="h-5 w-5 text-emerald-600" />}
                value={`${p.completedJobs}`} label="Tamamlanan iş" />
              <StatCard icon={<Repeat className="h-5 w-5 text-emerald-600" />}
                value={`%${repeatRate}`} label="Tekrar tercih" />
              <StatCard icon={<Clock className="h-5 w-5 text-navy-400" />}
                value={p.avgResponseMin ? `${p.avgResponseMin} dk` : "—"} label="Ort. yanıt" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Sol: hakkında + portföy */}
          <div className="space-y-6 lg:col-span-2">
            {p.bio && (
              <section className="card p-6">
                <h2 className="mb-2 font-display text-lg font-bold text-navy-900">Hakkında</h2>
                <p className="whitespace-pre-line text-sm text-navy-600">{p.bio}</p>
              </section>
            )}

            {p.portfolio.length > 0 && (
              <section className="card p-6">
                <h2 className="mb-3 font-display text-lg font-bold text-navy-900">Portföy</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {p.portfolio.map((m, i) =>
                    /\.(mp4|webm|mov)(\?|$)/i.test(m) ? (
                      // eslint-disable-next-line jsx-a11y/media-has-caption
                      <video key={i} src={m} controls className="h-32 w-full rounded-xl border border-navy-100 object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={m} alt="" className="h-32 w-full rounded-xl border border-navy-100 object-cover" />
                    ),
                  )}
                </div>
              </section>
            )}

            {/* Değerlendirmeler */}
            <section className="card p-6">
              <h2 className="mb-3 font-display text-lg font-bold text-navy-900">
                Değerlendirmeler ({p.ratingCount})
              </h2>

              {/* Kriter ortalamaları */}
              {p.ratingCount > 0 && (
                <div className="mb-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {REVIEW_CRITERIA.map((c) => {
                    const v = criteriaAvg[c.key as keyof typeof criteriaAvg] as number | null;
                    if (!v) return null;
                    return (
                      <div key={c.key} className="flex items-center justify-between text-sm">
                        <span className="text-navy-500">{c.label}</span>
                        <span className="inline-flex items-center gap-1 font-medium text-navy-800">
                          <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" /> {v.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-sm text-navy-400">Henüz değerlendirme yok.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-t border-navy-100 pt-4 first:border-0 first:pt-0">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} className={n <= r.rating ? "h-4 w-4 fill-gold-400 text-gold-400" : "h-4 w-4 text-navy-200"} />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-navy-800">{r.author.fullName}</span>
                        <span className="text-xs text-navy-400">
                          {new Date(r.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                      {r.comment && <p className="mt-1.5 text-sm text-navy-600">{r.comment}</p>}
                      {r.providerReply && (
                        <div className="mt-2 rounded-lg bg-navy-50 p-3 text-sm">
                          <p className="text-xs font-semibold text-navy-700">Yanıt</p>
                          <p className="mt-0.5 text-navy-600">{r.providerReply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sağ: bilgiler */}
          <aside className="space-y-6">
            <section className="card p-6">
              <h2 className="mb-3 font-display text-lg font-bold text-navy-900">Bilgiler</h2>
              <ul className="space-y-2 text-sm text-navy-600">
                {(p.city || p.district) && (
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    {p.city}{p.district ? ` / ${p.district}` : ""}
                  </li>
                )}
                {p.experienceYears != null && (
                  <li className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-emerald-600" /> {p.experienceYears} yıl deneyim
                  </li>
                )}
                {p.availabilityNote && (
                  <li className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-emerald-600" /> {p.availabilityNote}
                  </li>
                )}
                {(p.workStart || p.workEnd) && (
                  <li className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-emerald-600" />
                    Çalışma saatleri: {p.workStart || "?"}–{p.workEnd || "?"}
                  </li>
                )}
                {p.sameDayAvailable && (
                  <li className="flex items-center gap-2 font-medium text-red-600">
                    <Zap className="h-4 w-4" /> Aynı gün hizmet verir
                  </li>
                )}
              </ul>
              {p.workDays && p.workDays.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {WEEKDAYS.filter((d) => p.workDays.includes(d.key)).map((d) => (
                    <span key={d.key} className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">{d.label}</span>
                  ))}
                </div>
              )}

              {p.categories.length > 0 && (
                <div className="mt-4">
                  <p className="mb-1.5 text-xs font-semibold text-navy-500">Verdiği hizmetler</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.categories.map((c) => (
                      <span key={c.id} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {p.serviceAreas.length > 0 && (
                <div className="mt-4">
                  <p className="mb-1.5 text-xs font-semibold text-navy-500">Hizmet bölgeleri</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.serviceAreas.map((a) => (
                      <span key={a} className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs text-navy-600">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="card bg-navy-50/50 p-6 text-sm text-navy-600">
              <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-600" />
              İletişim, güvenliğin için ilk temasta uygulama içi mesajlaşma ile sağlanır.
              Bir talep oluşturup bu hizmet vereni davet edebilirsin.
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-3 text-center">
      <div className="flex justify-center">{icon}</div>
      <p className="mt-1 font-display text-lg font-extrabold text-navy-900">{value}</p>
      <p className="text-xs text-navy-400">{label}</p>
    </div>
  );
}
