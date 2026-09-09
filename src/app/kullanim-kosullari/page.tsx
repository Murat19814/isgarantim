import { LegalShell, Section, Bullets } from "@/components/legal/LegalShell";
import { LEGAL, APP_NAME, APP_DOMAIN } from "@/lib/constants";

export const metadata = {
  title: "Kullanım Koşulları",
  description: "İşKalkan platformu kullanım koşulları ve üyelik sözleşmesi.",
};

export default function Page() {
  return (
    <LegalShell
      title="Kullanım Koşulları"
      subtitle={`${APP_NAME} (${APP_DOMAIN}) platformunu kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.`}
      updated={LEGAL.lastUpdated}
    >
      <Section title="1. Taraflar ve Kapsam">
        <p>
          Bu Kullanım Koşulları, {LEGAL.companyName} (&quot;{APP_NAME}&quot; veya
          &quot;Platform&quot;) ile Platform&apos;a üye olan veya Platform&apos;u
          kullanan gerçek/tüzel kişiler (&quot;Kullanıcı&quot;) arasındaki
          ilişkiyi düzenler. Platform; hizmet alan, hizmet veren, iş arayan ve
          işveren kullanıcılarını bir araya getiren bir aracı hizmet
          sağlayıcıdır.
        </p>
      </Section>

      <Section title="2. Platformun Rolü">
        <Bullets
          items={[
            "İşKalkan, kullanıcıları buluşturan bir aracı platformdur; hizmetin bizzat sağlayıcısı veya işçi/işveren değildir.",
            "Hizmetlerin ifasına ilişkin sorumluluk, ilgili hizmet veren ile hizmet alan arasındadır.",
            "Platform, taraflar arasındaki ödemeyi emanet (escrow) sistemiyle güvence altına alır; iş onaylanana kadar ödeme serbest bırakılmaz.",
          ]}
        />
      </Section>

      <Section title="3. Üyelik ve Hesap Güvenliği">
        <Bullets
          items={[
            "Üyelik için verdiğiniz bilgilerin doğru ve güncel olması gerekir.",
            "18 yaşından büyük olmalısınız.",
            "Hesap güvenliğinden ve parolanızın gizliliğinden siz sorumlusunuz.",
            "Hesabınızda yetkisiz bir kullanım fark ederseniz derhal bize bildirmelisiniz.",
          ]}
        />
      </Section>

      <Section title="4. Kullanıcı Yükümlülükleri">
        <Bullets
          items={[
            "Yürürlükteki mevzuata, ahlaka ve dürüstlük kurallarına uygun davranmak.",
            "Yanıltıcı, hakaret içeren, yasa dışı veya üçüncü kişilerin haklarını ihlal eden içerik paylaşmamak.",
            "Platform dışına yönlendirme yaparak komisyon/emanet sistemini atlatmaya çalışmamak.",
            "Başkasının kimliğini veya bilgilerini izinsiz kullanmamak.",
            "Platformun güvenliğini tehdit edecek eylemlerde (otomatik veri çekme, saldırı, kötü amaçlı yazılım vb.) bulunmamak.",
          ]}
        />
      </Section>

      <Section title="5. Kontör ve Ücretlendirme">
        <Bullets
          items={[
            "Hizmet verenler, tekliflerini iletebilmek için kontör kullanır. Teklif verildiğinde kontör beklemeye alınır; teklif kazanılırsa kontör kesilir, kaybedilirse iade edilir.",
            "İşverenler iş ilanı yayımlamak için ilan hakkı kullanır. Lansman kampanyası kapsamında ilk ilanlar ücretsiz olabilir; kampanya koşulları Platform tarafından değiştirilebilir.",
            "Emanet ödemelerden Platform komisyonu tahsil edilebilir; komisyon oranı ilgili işlem öncesinde belirtilir.",
          ]}
        />
      </Section>

      <Section title="6. Emanet Ödeme ve İş Akışı">
        <p>
          Ödeme, müşteri tarafından emanete alınır ve iş tamamlanıp müşteri
          onayı verildikten sonra hizmet verene aktarılır. Onay süresi ve itiraz
          süreçleri Platform üzerinde belirtilen kurallara tabidir. Uyuşmazlık
          halinde Platform, sunulan delilleri değerlendirerek ödemenin serbest
          bırakılması veya iadesi yönünde karar verebilir.
        </p>
      </Section>

      <Section title="7. Fikri Mülkiyet">
        <p>
          Platform&apos;a ait tüm marka, logo, tasarım, yazılım ve içerikler
          {" "}{LEGAL.companyName}&apos;e aittir ve izinsiz kullanılamaz.
          Kullanıcıların yüklediği içeriklerin sorumluluğu kendilerine aittir.
        </p>
      </Section>

      <Section title="8. Sorumluluğun Sınırlandırılması">
        <p>
          Platform, aracı konumu gereği, kullanıcılar arasındaki hizmetin
          kalitesi, ayıpları veya ifa edilmemesinden doğrudan sorumlu değildir.
          Platform hizmeti &quot;olduğu gibi&quot; sunulur; kesintisizlik veya
          hatasızlık garanti edilmez. Mevzuatın izin verdiği azami ölçüde
          dolaylı zararlardan sorumluluk kabul edilmez.
        </p>
      </Section>

      <Section title="9. Hesabın Askıya Alınması / Feshi">
        <p>
          Bu koşulların ihlali halinde Platform, kullanıcının hesabını uyarı
          yapmaksızın askıya alabilir veya kapatabilir. Kullanıcı da dilediği
          zaman hesabını kapatma talebinde bulunabilir.
        </p>
      </Section>

      <Section title="10. Uygulanacak Hukuk ve Yetki">
        <p>
          Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda
          Türkiye Cumhuriyeti mahkeme ve icra daireleri ile tüketici hakem
          heyetleri yetkilidir.
        </p>
      </Section>

      <Section title="11. Değişiklikler ve İletişim">
        <p>
          Platform, bu koşulları güncelleyebilir; güncel sürüm bu sayfada
          yayımlanır. Sorularınız için:{" "}
          <strong>{LEGAL.supportEmail}</strong>
        </p>
      </Section>
    </LegalShell>
  );
}
