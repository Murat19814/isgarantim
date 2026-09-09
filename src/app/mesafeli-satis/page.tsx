import { LegalShell, Section, Bullets } from "@/components/legal/LegalShell";
import { LEGAL, APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Mesafeli Satış Sözleşmesi",
  description:
    "İşKalkan mesafeli satış sözleşmesi — kontör ve dijital hizmet satın alımları.",
};

export default function Page() {
  return (
    <LegalShell
      title="Mesafeli Satış Sözleşmesi"
      subtitle="6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında düzenlenmiştir."
      updated={LEGAL.lastUpdated}
    >
      <Section title="1. Taraflar">
        <p className="font-semibold text-navy-900">Satıcı / Hizmet Sağlayıcı</p>
        <Bullets
          items={[
            <>Ünvan: {LEGAL.companyName} ({APP_NAME})</>,
            <>Adres: {LEGAL.address}</>,
            <>MERSİS: {LEGAL.mersis}</>,
            <>Vergi Dairesi/No: {LEGAL.taxOffice} / {LEGAL.taxNumber}</>,
            <>E-posta: {LEGAL.supportEmail}</>,
            <>Telefon: {LEGAL.phone}</>,
          ]}
        />
        <p className="mt-3 font-semibold text-navy-900">Alıcı</p>
        <p>
          Platform üzerinden hizmet/kontör satın alan üye (&quot;Alıcı&quot;).
          Alıcının işlem sırasında sağladığı ad-soyad, adres ve iletişim
          bilgileri esas alınır.
        </p>
      </Section>

      <Section title="2. Sözleşmenin Konusu">
        <p>
          İşbu sözleşmenin konusu, Alıcı&apos;nın Platform üzerinden elektronik
          ortamda sipariş verdiği; kontör paketleri, iş ilanı yayımlama hakları
          ve benzeri dijital hizmetlerin satışı ile ifasına ilişkin tarafların
          hak ve yükümlülüklerinin belirlenmesidir.
        </p>
      </Section>

      <Section title="3. Ürün/Hizmet ve Bedel">
        <Bullets
          items={[
            "Satın alınan dijital hizmetin adı, adedi ve bedeli sipariş/ödeme ekranında belirtilir.",
            "Tüm bedeller Türk Lirası (TRY) cinsinden ve KDV dahil gösterilir.",
            "Ödeme, lisanslı ödeme kuruluşu altyapısı üzerinden güvenli şekilde tahsil edilir; kart bilgileri Platform tarafından saklanmaz.",
          ]}
        />
      </Section>

      <Section title="4. İfa ve Teslim">
        <p>
          Dijital hizmetler (kontör, ilan hakkı vb.) ödeme onayının ardından
          Alıcı&apos;nın hesabına anında tanımlanır. Teslim, hizmetin hesaba
          tanımlanmasıyla gerçekleşmiş sayılır.
        </p>
      </Section>

      <Section title="5. Cayma Hakkı ve İstisnası">
        <p>
          Mesafeli Sözleşmeler Yönetmeliği m.15 uyarınca; elektronik ortamda
          anında ifa edilen dijital içerik ve hizmetlerde, ifaya
          <strong> Alıcı&apos;nın onayı ile başlanması</strong> halinde cayma
          hakkı kullanılamaz. Alıcı, kontör/ilan hakkı gibi dijital hizmetlerde
          ifaya derhal başlanmasını ve bu nedenle cayma hakkının sona ereceğini
          kabul eder.
        </p>
        <p>
          Henüz kullanılmamış ve ifasına başlanmamış hizmetlerde, mevzuatın
          öngördüğü hallerde iade talepleri {LEGAL.supportEmail} üzerinden
          değerlendirilir.
        </p>
      </Section>

      <Section title="6. Emanet Ödemeler (Hizmet Alımları)">
        <p>
          Hizmet alan ile hizmet veren arasındaki iş bedeli, emanet (escrow)
          sisteminde tutulur ve iş tamamlanıp onaylandığında hizmet verene
          aktarılır. İş tamamlanmaz veya uyuşmazlık lehine sonuçlanırsa, emanetteki
          tutar Alıcı&apos;ya iade edilebilir. Bu işlemlerde Platform, aracı ve
          emanet yöneticisi konumundadır.
        </p>
      </Section>

      <Section title="7. Fatura">
        <p>
          Satın alınan dijital hizmetlere ilişkin fatura, mevzuata uygun şekilde
          düzenlenir ve Alıcı&apos;nın e-posta adresine/hesabına iletilir.
        </p>
      </Section>

      <Section title="8. Uyuşmazlıkların Çözümü">
        <p>
          Alıcı, şikâyet ve itirazlarını {LEGAL.supportEmail} adresine
          iletebilir. Uyuşmazlık halinde, Ticaret Bakanlığı&apos;nca ilan edilen
          parasal sınırlar dâhilinde Alıcı&apos;nın yerleşim yerindeki Tüketici
          Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.
        </p>
      </Section>

      <Section title="9. Yürürlük">
        <p>
          Alıcı, ödeme işlemini onayladığında bu sözleşmenin tüm koşullarını
          okuduğunu ve kabul ettiğini beyan eder. Sözleşme, elektronik ortamda
          onaylandığı anda yürürlüğe girer.
        </p>
      </Section>
    </LegalShell>
  );
}
