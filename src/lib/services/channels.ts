/**
 * Harici bildirim kanalları (e-posta / SMS / push).
 *
 * NOT: Şu an bir sağlayıcı (SMTP/SendGrid/Twilio vb.) bağlı DEĞİL.
 * İlgili env değişkenleri tanımlanana kadar bu fonksiyonlar güvenli
 * biçimde no-op çalışır (sadece log). Böylece ana akış hiç bozulmaz.
 * Sağlayıcı eklenince yalnızca bu dosya güncellenir.
 */

export async function sendEmail(to: string, subject: string, body: string) {
  if (!process.env.EMAIL_PROVIDER_KEY) {
    // Yapılandırılmadı — sessizce geç.
    return { sent: false, reason: "not_configured" as const };
  }
  try {
    // TODO: gerçek sağlayıcı entegrasyonu (SendGrid/SMTP)
    console.info(`[email] → ${to}: ${subject}`);
    return { sent: true as const };
  } catch (e) {
    console.error("[email] başarısız:", e);
    return { sent: false, reason: "error" as const };
  }
}

export async function sendSms(to: string, body: string) {
  if (!process.env.SMS_PROVIDER_KEY) {
    return { sent: false, reason: "not_configured" as const };
  }
  try {
    // TODO: gerçek sağlayıcı entegrasyonu (Twilio/Netgsm)
    console.info(`[sms] → ${to}: ${body.slice(0, 40)}…`);
    return { sent: true as const };
  } catch (e) {
    console.error("[sms] başarısız:", e);
    return { sent: false, reason: "error" as const };
  }
}
