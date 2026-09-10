import { listFlags } from "@/lib/services/flags";
import { FeatureFlagManager } from "@/components/admin/FeatureFlagManager";

export const metadata = { title: "Özellik Bayrakları — Admin" };

export default async function Page() {
  const flags = await listFlags();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-navy-900">Özellik Bayrakları</h1>
      <p className="mt-1 max-w-2xl text-sm text-navy-500">
        Tüm ücret/komisyon/paket özellikleri varsayılan <b>kapalıdır</b>. 1. yıl ücretsiz modeli
        gereği bir özelliği açana kadar kullanıcıya görünmez ve ücretlendirme yapılmaz.
        Açtığında fiyatı da buradan belirleyebilirsin.
      </p>
      <div className="mt-6">
        <FeatureFlagManager flags={flags} />
      </div>
    </div>
  );
}
