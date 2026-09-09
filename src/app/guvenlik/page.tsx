import { LegalShell, Section, Bullets } from "@/components/legal/LegalShell";
import { LEGAL } from "@/lib/constants";

export const metadata = {
  title: "Güvenlik & Emanet",
  description:
    "İşKalkan emanet ödeme sistemi ve hesap güvenliği hakkında bilmeniz gerekenler.",
};

export default function Page() {
  return (
    <LegalShell
      title="Güvenlik & Emanet"
      subtitle="Paranız ve verileriniz nasıl korunuyor?"
    >
      <Section title="Emanet (Escrow) Nasıl Çalışır?">
        <Bullets
          items={[
            "1. Teklif seçildikten sonra ödeme, güvenli emanet havuzuna alınır.",
            "2. Ödeme emanete alınana kadar hizmet veren işe başlamaz; iletişim bilgileri de bu aşamada açılır.",
            "3. Hizmet veren işi tamamlar ve teslim eder.",
            "4. Siz işi kontrol edip onayladığınızda ödeme hizmet verene aktarılır.",
            "5. Bir sorun olursa itiraz açabilirsiniz; ekibimiz inceleyip adil bir çözüm sunar.",
          ]}
        />
      </Section>

      <Section title="Ödeme Güvenliği">
        <p>
          Ödemeler lisanslı ödeme kuruluşu altyapısı üzerinden işlenir. Kart
          bilgileriniz platformumuzda <strong>saklanmaz</strong>; ödeme
          kuruluşunun güvenli ortamında işlenir. Tüm bağlantılar HTTPS/TLS ile
          şifrelenir.
        </p>
      </Section>

      <Section title="Hesap Güvenliği">
        <Bullets
          items={[
            "Parolalarınız geri döndürülemez şekilde şifrelenerek (hash) saklanır.",
            "E-posta ve telefon doğrulaması ile hesabınız korunur.",
            "Şüpheli aktivitelere karşı hız sınırı (rate limiting) ve oturum güvenliği uygulanır.",
            "Güçlü ve size özel bir parola kullanın, parolanızı kimseyle paylaşmayın.",
          ]}
        />
      </Section>

      <Section title="Dolandırıcılığa Karşı İpuçları">
        <Bullets
          items={[
            "Ödemeyi asla platform dışında yapmayın; emanet dışı ödemeler güvence kapsamında değildir.",
            "İletişim bilgilerinizi ödeme emanete alınmadan paylaşmanız istenirse dikkatli olun.",
            "Gerçekçi olmayan derecede düşük fiyatlı veya acele ettiren tekliflere şüpheyle yaklaşın.",
            "Şüpheli bir durumla karşılaşırsanız hemen bize bildirin.",
          ]}
        />
      </Section>

      <Section title="Güvenlik Açığı Bildirimi">
        <p>
          Bir güvenlik açığı fark ederseniz, kötüye kullanmadan{" "}
          <strong>{LEGAL.supportEmail}</strong> adresine bildirin. Kullanıcı
          güvenliği bizim için önceliktir.
        </p>
      </Section>
    </LegalShell>
  );
}
