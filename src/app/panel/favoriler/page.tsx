import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Star, Briefcase, MapPin, Award, Heart } from "lucide-react";
import { auth } from "@/lib/auth/session";
import { listFavorites } from "@/lib/services/favorites";

export const metadata = { title: "Favori Hizmet Verenler" };

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/favoriler");

  const favorites = await listFavorites(session.user.id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/panel"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> Panele dön
      </Link>
      <h1 className="mb-1 flex items-center gap-2 font-display text-2xl font-extrabold text-navy-900">
        <Heart className="h-6 w-6 text-red-500" /> Favori hizmet verenlerim
      </h1>
      <p className="mb-6 text-sm text-navy-500">Beğendiğin hizmet verenleri buradan takip et.</p>

      {favorites.length === 0 ? (
        <div className="card p-8 text-center text-navy-500">
          Henüz favori eklemedin. Bir hizmet verenin profilinden kalp simgesine dokun.
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((p) => (
            <Link
              key={p.id}
              href={`/hizmet-veren/${p.id}`}
              className="group card flex items-center gap-4 p-4 transition-all hover:shadow-card"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy-800 font-display text-sm font-bold text-gold-400">
                {p.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.avatarUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                ) : (
                  p.fullName.slice(0, 2).toUpperCase()
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-semibold text-navy-900">{p.fullName}</p>
                  {p.isFounder && <Award className="h-4 w-4 shrink-0 text-gold-500" />}
                </div>
                <p className="truncate text-xs text-navy-400">
                  {p.providerProfile?.headline ?? "Hizmet Veren"}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-navy-500">
                  {p.providerProfile?.city && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {p.providerProfile.city}
                    </span>
                  )}
                  {(p.providerProfile?.ratingCount ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                      {p.providerProfile!.ratingAvg.toFixed(1)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3 w-3" /> {p.providerProfile?.completedJobs ?? 0} iş
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
