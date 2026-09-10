import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth/session";
import { getUserBadges, getMyVerifications } from "@/lib/services/verification";
import { VerificationCenter } from "@/components/VerificationCenter";

export const metadata = { title: "Doğrulama Merkezi" };

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/dogrulama");

  const [badges, applications] = await Promise.all([
    getUserBadges(session.user.id),
    getMyVerifications(session.user.id),
  ]);

  const appMap: Record<string, { status: string; adminNote: string | null }> = {};
  for (const a of applications) appMap[a.type] = { status: a.status, adminNote: a.adminNote };

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/panel"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> Panele dön
      </Link>
      <h1 className="mb-2 font-display text-2xl font-extrabold text-navy-900">
        Doğrulama Merkezi
      </h1>
      <p className="mb-6 text-sm text-navy-500">
        Rozetlerin profilinde güven oluşturur. Yüklediğin belgeler{" "}
        <b>herkese kapalıdır</b>, yalnızca onay ekibimiz görür. Rozetler onaylandıktan
        sonra profilinde görünür.
      </p>
      <VerificationCenter badges={badges} applications={appMap} />
    </div>
  );
}
