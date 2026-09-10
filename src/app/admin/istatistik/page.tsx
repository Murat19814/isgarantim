import { Users, ClipboardList, CheckCircle2, Award, Gift, Star } from "lucide-react";
import { getAdvancedStats } from "@/lib/services/admin";
import { BarList } from "@/components/admin/BarList";

export const metadata = { title: "İstatistikler — Admin" };

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Taslak",
  OPEN: "Açık",
  OFFER_SELECTED: "Teklif seçildi",
  SCHEDULED: "Randevu",
  IN_PROGRESS: "Devam ediyor",
  DELIVERED: "Onay bekliyor",
  COMPLETED: "Tamamlandı",
  PROBLEM_REPORTED: "Sorun bildirildi",
  DISPUTED: "İtiraz",
  CANCELLED: "İptal",
  IN_ESCROW: "Emanette",
};

export default async function Page() {
  const s = await getAdvancedStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-900">İstatistikler</h1>
        <p className="mt-1 text-sm text-navy-500">Son 30 gün ve genel platform metrikleri.</p>
      </div>

      {/* Son 30 gün */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi icon={<Users className="h-5 w-5 text-emerald-600" />} value={s.newUsers30} label="Yeni üye (30g)" />
        <Kpi icon={<ClipboardList className="h-5 w-5 text-emerald-600" />} value={s.newRequests30} label="Yeni talep (30g)" />
        <Kpi icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} value={s.completed30} label="Tamamlanan iş (30g)" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Taleplerin durum dağılımı">
          <BarList items={s.byStatus.map((x) => ({ label: STATUS_LABELS[x.status] ?? x.status, value: x.count }))} />
        </Card>
        <Card title="En popüler kategoriler">
          <BarList items={s.byCategory.map((x) => ({ label: x.name, value: x.count }))} />
        </Card>
        <Card title="En çok talep gelen şehirler">
          <BarList items={s.byCity.map((x) => ({ label: x.city, value: x.count }))} />
        </Card>
        <Card title="Davet sistemi">
          <div className="mb-3 grid grid-cols-2 gap-3">
            <Kpi small icon={<Gift className="h-4 w-4 text-emerald-600" />} value={s.referral.totalReferred} label="Davetle gelen" />
            <Kpi small icon={<Award className="h-4 w-4 text-gold-500" />} value={s.referral.founders} label="Kurucu Üye" />
          </div>
          <p className="mb-2 text-xs font-semibold text-navy-500">En çok davet edenler</p>
          <BarList items={s.referral.topInviters.map((x) => ({ label: x.name + (x.isFounder ? " 🏅" : ""), value: x.count }))} />
        </Card>
      </div>

      {/* Lider tablosu */}
      <Card title="En iyi hizmet verenler">
        <div className="divide-y divide-navy-50">
          {s.topProviders.length === 0 ? (
            <p className="py-4 text-sm text-navy-400">Henüz veri yok.</p>
          ) : (
            s.topProviders.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-navy-100 text-xs font-bold text-navy-600">
                    {i + 1}
                  </span>
                  <span className="font-medium text-navy-800">{p.name}</span>
                  {p.isFounder && <Award className="h-3.5 w-3.5 text-gold-500" />}
                </span>
                <span className="flex items-center gap-4 text-xs text-navy-500">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                    {p.ratingCount > 0 ? p.ratingAvg.toFixed(1) : "—"}
                  </span>
                  <span className="font-semibold text-emerald-700">{p.completedJobs} iş</span>
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function Kpi({ icon, value, label, small }: { icon: React.ReactNode; value: number; label: string; small?: boolean }) {
  return (
    <div className={small ? "rounded-xl border border-navy-100 p-3 text-center" : "card p-5 text-center"}>
      <div className="flex justify-center">{icon}</div>
      <p className={small ? "mt-1 font-display text-lg font-extrabold text-navy-900" : "mt-1 font-display text-2xl font-extrabold text-navy-900"}>{value}</p>
      <p className="text-xs text-navy-400">{label}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="mb-3 font-display text-lg font-bold text-navy-900">{title}</h2>
      {children}
    </div>
  );
}
