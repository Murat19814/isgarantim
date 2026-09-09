import { LegalShell, Section, Bullets } from "@/components/legal/LegalShell";
import { LEGAL, APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Çerez Politikası",
  description: "İşKalkan çerez (cookie) politikası ve çerez tercihleri.",
};

export default function Page() {
  return (
    <LegalShell
      title="Çerez Politikası"
      subtitle={`${APP_NAME} hangi çerezleri, neden kullandığını açıklar.`}
      updated={LEGAL.lastUpdated}
    >
      <Section title="1. Çerez Nedir?">
        <p>
          Çerezler (cookies), ziyaret ettiğiniz web sitelerinin tarayıcınıza
          kaydettiği küçük metin dosyalarıdır. Çerezler; oturumunuzu açık
          tutmak, tercihlerinizi hatırlamak ve platformun güvenli çalışmasını
          sağlamak için kullanılır.
        </p>
      </Section>

      <Section title="2. Kullandığımız Çerez Türleri">
        <Bullets
          items={[
            "Zorunlu çerezler: Oturum açma, kimlik doğrulama ve güvenlik için gereklidir. Bunlar olmadan platform çalışmaz ve devre dışı bırakılamaz.",
            "İşlevsel çerezler: Dil, tema ve benzeri tercihlerinizi hatırlar.",
            "Performans/analitik çerezleri: Platformun nasıl kullanıldığını anonim olarak ölçer ve iyileştirmemize yardımcı olur.",
          ]}
        />
      </Section>

      <Section title="3. Oturum Çerezleri">
        <p>
          Güvenli giriş için oturum (session) çerezleri kullanılır. Bu çerezler,
          hesabınıza yetkisiz erişimi önlemek amacıyla şifrelenmiş bilgi taşır ve
          çıkış yaptığınızda veya süre dolduğunda geçersiz hale gelir.
        </p>
      </Section>

      <Section title="4. Üçüncü Taraf Çerezleri">
        <p>
          Ödeme işlemleri sırasında lisanslı ödeme kuruluşunun; içerik gösterimi
          sırasında ise güvenilir altyapı sağlayıcılarının çerezleri devreye
          girebilir. Bu tarafların çerez uygulamaları kendi politikalarına
          tabidir.
        </p>
      </Section>

      <Section title="5. Çerezleri Nasıl Yönetirsiniz?">
        <p>
          Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz.
          Ancak zorunlu çerezleri engellemeniz halinde giriş yapma gibi temel
          özellikler çalışmayabilir. Popüler tarayıcıların çerez ayarları,
          ilgili tarayıcının &quot;Gizlilik/Güvenlik&quot; menüsünde yer alır.
        </p>
      </Section>

      <Section title="6. İletişim">
        <p>
          Çerez uygulamalarımıza ilişkin sorularınız için:{" "}
          <strong>{LEGAL.kvkkEmail}</strong>. Kişisel verilerin işlenmesi
          hakkında ayrıntı için{" "}
          <a href="/kvkk" className="text-emerald-600 underline">
            KVKK / Gizlilik Politikası
          </a>{" "}
          sayfamıza bakabilirsiniz.
        </p>
      </Section>
    </LegalShell>
  );
}
