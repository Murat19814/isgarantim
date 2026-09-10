import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { auth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getMyProviderProfile } from "@/lib/services/providerProfile";
import { ProviderProfileForm } from "@/components/provider/ProviderProfileForm";

export const metadata = { title: "Profilim" };

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/hizmet-ver/profil");

  const [profile, categories] = await Promise.all([
    getMyProviderProfile(session.user.id),
    prisma.serviceCategory.findMany({
      where: { parentId: null, isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/panel/hizmet-ver"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> Panele dön
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-navy-900">Profilim</h1>
        <Link
          href={`/hizmet-veren/${session.user.id}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          Herkese açık profilim <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
      <ProviderProfileForm
        categories={categories}
        initial={
          profile
            ? {
                headline: profile.headline ?? "",
                bio: profile.bio ?? "",
                city: profile.city ?? "",
                district: profile.district ?? "",
                coverUrl: profile.coverUrl ?? "",
                experienceYears: profile.experienceYears ?? undefined,
                availabilityNote: profile.availabilityNote ?? "",
                serviceAreas: profile.serviceAreas ?? [],
                portfolio: profile.portfolio ?? [],
                categoryIds: profile.categories.map((c) => c.id),
                workDays: profile.workDays ?? [],
                workStart: profile.workStart ?? "",
                workEnd: profile.workEnd ?? "",
                sameDayAvailable: profile.sameDayAvailable ?? false,
                gender: profile.gender ?? "",
                worksWithTeam: profile.worksWithTeam ?? false,
              }
            : null
        }
      />
    </div>
  );
}
