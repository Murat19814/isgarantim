import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth/session";
import { getOrCreateWallet } from "@/lib/services/credits";
import { listOpenRequests } from "@/lib/services/serviceRequests";
import { ProviderDashboard } from "@/components/provider/ProviderDashboard";

export const metadata = { title: "Hizmet Veren Paneli" };

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/hizmet-ver");

  const [wallet, openRequests] = await Promise.all([
    getOrCreateWallet(session.user.id),
    listOpenRequests(),
  ]);

  // Kendi taleplerini listeden çıkar
  const requests = openRequests
    .filter((r) => r.customerId !== session.user.id)
    .map((r) => ({
      id: r.id,
      title: r.title,
      city: r.city,
      district: r.district,
      categoryName: r.category.name,
      offerCount: r._count.offers,
      budgetMin: r.budgetMin,
      budgetMax: r.budgetMax,
    }));

  return (
    <div>
      <Link
        href="/panel"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> Panele dön
      </Link>
      <h1 className="mb-6 font-display text-2xl font-extrabold text-navy-900">
        Hizmet veren paneli
      </h1>
      <ProviderDashboard
        initialBalance={wallet.balance}
        initialHeld={wallet.heldBalance}
        requests={requests}
      />
    </div>
  );
}
