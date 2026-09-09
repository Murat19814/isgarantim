import { LegalShell, Section } from "@/components/legal/LegalShell";
import { LEGAL } from "@/lib/constants";

export const metadata = {
  title: "Yardım Merkezi",
  description: "İşKalkan sık sorulan sorular ve yardım rehberi.",
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "İşKalkan nasıl çalışır?",
    a: "Hizmet almak için talep oluşturursunuz, doğrulanmış hizmet verenler teklif verir, en uygununu seçip ödemeyi emanete alırsınız. İş tamamlanıp onayladığınızda ödeme hizmet verene aktarılır.",
  },
  {
    q: "Ödemem güvende mi?",
    a: "Evet. Ödemeniz iş tamamlanıp siz onaylayana kadar emanet havuzunda tutulur. Bir sorun olursa itiraz açabilirsiniz.",
  },
  {
    q: "Kontör nedir, ne işe yarar?",
    a: "Hizmet verenler tekliflerini iletebilmek için kontör kullanır. Teklif verildiğinde kontör beklemeye alınır; teklif kazanılırsa kesilir, kaybedilirse iade edilir.",
  },
  {
    q: "İş ilanı vermek ücretli mi?",
    a: "Lansmana özel olarak firmalar için ilk 6 iş ilanı ücretsizdir. Hakkınız bittiğinde uygun planlardan biriyle devam edebilirsiniz.",
  },
  {
    q: "Hesabımı nasıl doğrularım?",
    a: "Kayıt sırasında e-posta ve telefonunuza gönderilen doğrulama kodunu girerek hesabınızı doğrulayabilirsiniz.",
  },
  {
    q: "İletişim bilgilerim ne zaman görünür olur?",
    a: "Karşı tarafın iletişim bilgileri, ödeme emanete alındıktan sonra platform içinde görünür hale gelir. Bu, platform dışı riskleri önlemek içindir.",
  },
  {
    q: "Bir sorun yaşarsam ne yapmalıyım?",
    a: `İlgili işlem sayfasından itiraz açabilir veya ${LEGAL.supportEmail} adresinden destek ekibimize ulaşabilirsiniz.`,
  },
];

export default function Page() {
  return (
    <LegalShell
      title="Yardım Merkezi"
      subtitle="En çok merak edilen soruların yanıtları burada."
    >
      {FAQ.map((item) => (
        <Section key={item.q} title={item.q}>
          <p>{item.a}</p>
        </Section>
      ))}

      <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
        Aradığın yanıtı bulamadın mı?{" "}
        <a href="/iletisim" className="font-semibold underline">
          İletişim
        </a>{" "}
        sayfasından bize yaz, yardımcı olalım.
      </p>
    </LegalShell>
  );
}
