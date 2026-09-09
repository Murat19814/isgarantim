import { LegalShell, Section, Bullets } from "@/components/legal/LegalShell";
import { LEGAL, APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "KVKK Aydınlatma Metni ve Gizlilik Politikası",
  description:
    "İşKalkan kişisel verilerin korunması (KVKK) aydınlatma metni ve gizlilik politikası.",
};

export default function Page() {
  return (
    <LegalShell
      title="KVKK Aydınlatma Metni ve Gizlilik Politikası"
      subtitle="6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında hazırlanmıştır."
      updated={LEGAL.lastUpdated}
    >
      <Section title="1. Veri Sorumlusu">
        <p>
          {LEGAL.companyName} ({APP_NAME}), 6698 sayılı Kişisel Verilerin
          Korunması Kanunu (&quot;KVKK&quot;) uyarınca &quot;veri sorumlusu&quot;
          sıfatıyla hareket etmektedir.
        </p>
        <Bullets
          items={[
            <>Ünvan: {LEGAL.companyName}</>,
            <>Adres: {LEGAL.address}</>,
            <>MERSİS No: {LEGAL.mersis}</>,
            <>KEP: {LEGAL.kepAddress}</>,
            <>E-posta: {LEGAL.kvkkEmail}</>,
          ]}
        />
      </Section>

      <Section title="2. İşlenen Kişisel Veriler">
        <Bullets
          items={[
            "Kimlik bilgileri: ad, soyad.",
            "İletişim bilgileri: e-posta, telefon numarası, adres/şehir.",
            "Üyelik bilgileri: kullanıcı rolü, hesap tercihleri, doğrulama durumu.",
            "İşlem bilgileri: hizmet talepleri, teklifler, mesajlar, iş ilanları, başvurular, CV içerikleri.",
            "Finansal bilgiler: emanet ödeme işlem kayıtları, fatura bilgileri (ödeme kartı bilgileri tarafımızca saklanmaz, lisanslı ödeme kuruluşunda işlenir).",
            "İşlem güvenliği bilgileri: IP adresi, oturum ve log kayıtları, çerez verileri.",
          ]}
        />
      </Section>

      <Section title="3. Kişisel Verilerin İşlenme Amaçları">
        <Bullets
          items={[
            "Üyelik oluşturma, kimlik doğrulama ve hesap yönetimi.",
            "Hizmet talebi, teklif, emanet ödeme ve iş ilanı süreçlerinin yürütülmesi.",
            "Taraflar arası güvenli iletişim ve platform içi mesajlaşma.",
            "Dolandırıcılık, kötüye kullanım ve platform dışı yönlendirmenin önlenmesi.",
            "Yasal yükümlülüklerin yerine getirilmesi (vergi, ticaret, KVKK vb.).",
            "Talep ve şikâyetlerin yönetimi, müşteri desteği.",
            "Hizmet kalitesinin artırılması ve istatistiksel analiz.",
          ]}
        />
      </Section>

      <Section title="4. İşlemenin Hukuki Sebepleri (KVKK m.5)">
        <Bullets
          items={[
            "Bir sözleşmenin kurulması veya ifası için gerekli olması.",
            "Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi.",
            "Bir hakkın tesisi, kullanılması veya korunması için zorunlu olması.",
            "İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla meşru menfaat.",
            "Gerekli hallerde açık rızanın alınması.",
          ]}
        />
      </Section>

      <Section title="5. Kişisel Verilerin Aktarılması">
        <p>
          Kişisel verileriniz; hizmetin gereği ölçüsünde ve KVKK m.8-9&apos;a
          uygun olarak, yalnızca aşağıdaki taraflarla paylaşılabilir:
        </p>
        <Bullets
          items={[
            "Lisanslı ödeme kuruluşları ve bankalar (emanet ödeme işlemleri için).",
            "Barındırma (hosting) ve altyapı hizmet sağlayıcıları.",
            "Yasal olarak yetkili kamu kurum ve kuruluşları ile adli merciler.",
            "Hizmetin ifası için karşı taraf (ör. seçtiğiniz hizmet veren / işveren) ile sınırlı bilgiler.",
          ]}
        />
        <p>
          Verileriniz, yasal zorunluluk olmadıkça yurt dışına aktarılmaz;
          aktarılması gereken hallerde KVKK&apos;nın öngördüğü şartlara uyulur.
        </p>
      </Section>

      <Section title="6. Saklama Süresi">
        <p>
          Kişisel verileriniz, işleme amacının gerektirdiği süre ve ilgili
          mevzuatta öngörülen zamanaşımı/saklama süreleri (ör. ticari ve mali
          kayıtlar için 10 yıl) boyunca saklanır; sürenin sonunda silinir, yok
          edilir veya anonim hale getirilir.
        </p>
      </Section>

      <Section title="7. Veri Güvenliği">
        <p>
          Verilerinizin güvenliği için idari ve teknik tedbirler uygulanır:
          şifreli bağlantı (HTTPS/TLS), parolaların geri döndürülemez şekilde
          şifrelenmesi (hash), yetki bazlı erişim, oturum güvenliği, hız sınırı
          (rate limiting) ve düzenli güvenlik güncellemeleri.
        </p>
      </Section>

      <Section title="8. İlgili Kişinin Hakları (KVKK m.11)">
        <p>Her ilgili kişi olarak şu haklara sahipsiniz:</p>
        <Bullets
          items={[
            "Kişisel verinizin işlenip işlenmediğini öğrenme ve buna ilişkin bilgi talep etme.",
            "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme.",
            "Yurt içinde/dışında aktarıldığı üçüncü kişileri bilme.",
            "Eksik veya yanlış işlenmişse düzeltilmesini isteme.",
            "Şartları oluştuğunda silinmesini/yok edilmesini isteme.",
            "İşlemenin münhasıran otomatik sistemlerle analizi sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme.",
            "Kanuna aykırı işleme nedeniyle zararınızın giderilmesini talep etme.",
          ]}
        />
        <p>
          Taleplerinizi <strong>{LEGAL.kvkkEmail}</strong> adresine iletebilir
          veya KEP adresimiz üzerinden gönderebilirsiniz. Başvurularınız en geç
          30 gün içinde sonuçlandırılır.
        </p>
      </Section>

      <Section title="9. Çerezler">
        <p>
          Platformumuzda çerez kullanımı hakkında ayrıntılı bilgi için{" "}
          <a href="/cerez" className="text-emerald-600 underline">
            Çerez Politikası
          </a>{" "}
          sayfamızı inceleyebilirsiniz.
        </p>
      </Section>

      <p className="rounded-xl bg-navy-100/60 p-4 text-sm text-navy-600">
        Bu metin bilgilendirme amaçlıdır ve zaman zaman güncellenebilir.
        Güncel sürüm her zaman bu sayfada yayınlanır.
      </p>
    </LegalShell>
  );
}
