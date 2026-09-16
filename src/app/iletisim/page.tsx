import { LegalShell, Section, Bullets } from "@/components/legal/LegalShell";
import { LEGAL, APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "İletişim",
  description: "İşGarantim iletişim bilgileri.",
};

export default function Page() {
  return (
    <LegalShell
      title="İletişim"
      subtitle={`${APP_NAME} ekibine ulaşın — sorularınızı ve önerilerinizi bekliyoruz.`}
    >
      <Section title="İletişim">
        <p>
          Şu an için bize yalnızca e-posta ile ulaşabilirsiniz. Müşteri hizmetleri
          telefon hattımız kısa süre içinde bu sayfada yayınlanacaktır.
        </p>
        <Bullets
          items={[
            <>
              Destek e-posta:{" "}
              <a
                href={`mailto:${LEGAL.supportEmail}`}
                className="text-emerald-600 underline"
              >
                {LEGAL.supportEmail}
              </a>
            </>,
            <>
              KVKK başvuruları:{" "}
              <a
                href={`mailto:${LEGAL.kvkkEmail}`}
                className="text-emerald-600 underline"
              >
                {LEGAL.kvkkEmail}
              </a>
            </>,
          ]}
        />
      </Section>

      <Section title="Destek Saatleri">
        <p>
          Hafta içi 09:00 – 18:00 arasında gelen talepler aynı gün, diğer
          zamanlarda gelenler ilk iş gününde yanıtlanır. Talebinizi net bir
          şekilde iletirseniz size daha hızlı yardımcı olabiliriz.
        </p>
      </Section>

      <Section title="Sık Sorulanlar">
        <p>
          Birçok sorunun yanıtını{" "}
          <a href="/yardim" className="text-emerald-600 underline">
            Yardım Merkezi
          </a>{" "}
          sayfamızda bulabilirsiniz.
        </p>
      </Section>
    </LegalShell>
  );
}
