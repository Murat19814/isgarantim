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
      <Section title="İletişim Bilgileri">
        <Bullets
          items={[
            <>Yetkili: {LEGAL.contactPerson}</>,
            <>Adres: {LEGAL.address}</>,
            <>
              Telefon:{" "}
              <a href={`tel:${LEGAL.phoneLink}`} className="text-emerald-600 underline">
                {LEGAL.phone}
              </a>
            </>,
            <>
              WhatsApp:{" "}
              <a
                href={`https://wa.me/${LEGAL.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 underline"
              >
                {LEGAL.whatsapp}
              </a>
            </>,
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
