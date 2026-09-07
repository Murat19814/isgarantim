/**
 * SMS gönderimi.
 * Geliştirmede konsola yazar; production'da Netgsm/Twilio vb. ile değiştirilir.
 */
export async function sendSms(to: string, message: string): Promise<void> {
  if (!process.env.SMS_API_KEY) {
    console.log(`\n📱 [DEV SMS] → ${to}\n   ${message}\n`);
    return;
  }
  // TODO(Faz 4): Netgsm/Twilio entegrasyonu
  console.log(`[sms] gönderiliyor: ${to}`);
}

export async function sendVerificationSms(to: string, code: string) {
  await sendSms(to, `İşKalkan doğrulama kodun: ${code} (10 dk geçerli)`);
}
