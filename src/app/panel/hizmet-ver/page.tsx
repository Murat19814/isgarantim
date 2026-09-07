import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, Briefcase } from "lucide-react";
import { auth } from "@/lib/auth/session";
import { getOrCreateWallet } from "@/lib/services/credits";
import {
  listOpenRequests,
  listProviderActiveJobs,
} from "@/lib/services/serviceRequests";
import { formatTRY } from "@/lib/utils";
import { ProviderDashboard } from "@/components/provider/ProviderDashboard";

export const metadata = { title: "Hizmet Veren Paneli" };

const JOB_STATUS: Record<string, { label: string; cls: string }> = {
  OFFER_SELECTED: { label: "Ödeme bekleniyor", cls: "badge-gold" },
  IN_ESCROW: { label: "İşe başla", cls: "badge-emerald" },
  DELIVERED: { label: "Onay bekliyor", cls: "badge-gold" },
  COMPLETED: { label: "Tamamlandı", cls: "badge-navy" },
  DISPUTED: { label: "İtiraz", cls: "badge-navy" },
};

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/giris?callbackUrl=/panel/hizmet-ver");

  const [wallet, openRequests, activeJobs] = await Promise.all([
    getOrCreateWallet(session.user.id),
    listOpenRequests(),
    listProviderActiveJobs(session.user.id),
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

      {/* Kazanılan işler */}
      {activeJobs.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-navy-900">
            <Briefcase className="h-5 w-5 text-emerald-600" /> Kazanılan işlerim (
            {activeJobs.length})
          </h2>
          <div className="space-y-3">
            {activeJobs.map((j) => {
              const r = j.serviceRequest;
              const st = JOB_STATUS[r.status] ?? {
                label: r.status,
                cls: "badge-navy",
              };
              return (
                <Link
                  key={j.id}
                  href={`/panel/hizmet-ver/${r.id}`}
                  className="group card flex items-center gap-4 p-5 transition-all hover:shadow-card"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={st.cls}>{st.label}</span>
                      <span className="text-xs text-navy-400">
                        {r.category.name}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-semibold text-navy-900">
                      {r.title}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-400">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {r.city}
                        {r.district ? ` / ${r.district}` : ""}
                      </span>
                      <span className="font-semibold text-emerald-700">
                        {formatTRY(j.price)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-navy-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <ProviderDashboard
        initialBalance={wallet.balance}
        initialHeld={wallet.heldBalance}
        requests={requests}
      />
    </div>
  );
}
