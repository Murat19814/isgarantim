import { LegalShell, Section, Bullets } from "@/components/legal/LegalShell";
import { LEGAL, APP_NAME, APP_SLOGAN } from "@/lib/constants";

export const metadata = {
  title: "Hakkımızda",
  description: "İşKalkan nedir, nasıl çalışır ve neyi amaçlar?",
};

export default function Page() {
  return (
    <LegalShell title="Hakkımızda" subtitle={APP_SLOGAN}>
      <Section title={`${APP_NAME} nedir?`}>
        <p>
          {APP_NAME}, hizmet almak isteyenlerle doğrulanmış hizmet verenleri; iş
          arayanlarla işverenleri güvenli ve şeffaf bir zeminde buluşturan bir
          dijital platformdur. Amacımız, hem işin hem de ödemenin güvence altında
          olduğu bir ekosistem kurmaktır.
        </p>
      </Section>

      <Section title="Neden İşKalkan?">
        <Bullets
          items={[
            "Emanet ödeme: Ödemeniz, iş tamamlanıp onaylanana kadar güvende tutulur.",
            "Doğrulanmış kullanıcılar: E-posta ve telefon doğrulaması ile daha güvenli bir topluluk.",
            "Şeffaf teklifler: Birden fazla teklifi karşılaştırıp size en uygununu seçin.",
            "Platform içi mesajlaşma: İletişiminiz kayıt altında ve güvende.",
            "Değerlendirme sistemi: Gerçek iş sonrası puan ve yorumlarla güven inşa edin.",
          ]}
        />
      </Section>

      <Section title="Misyonumuz">
        <p>
          Küçük işletmelerin, ustaların ve profesyonellerin emeğinin karşılığını
          güvenle almasını; hizmet alanların ise aradıkları kaliteye
          dolandırılma endişesi olmadan ulaşmasını sağlamak.
        </p>
      </Section>

      <Section title="İletişim">
        <p>
          Bize her zaman{" "}
          <a href="/iletisim" className="text-emerald-600 underline">
            İletişim
          </a>{" "}
          sayfamızdan veya <strong>{LEGAL.supportEmail}</strong> adresinden
          ulaşabilirsiniz.
        </p>
      </Section>
    </LegalShell>
  );
}
