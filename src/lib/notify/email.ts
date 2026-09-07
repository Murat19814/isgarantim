/**
 * E-posta gönderimi.
 * Geliştirmede konsola yazar; production'da SMTP (nodemailer) veya
 * transactional sağlayıcı (Resend/SendGrid) ile değiştirilir.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.log(
      `\n📧 [DEV E-POSTA] → ${opts.to}\n   Konu: ${opts.subject}\n   ${opts.text}\n`,
    );
    return;
  }
  // TODO(Faz 4): nodemailer ile gerçek SMTP gönderimi
  console.log(`[email] gönderiliyor: ${opts.to} — ${opts.subject}`);
}

export async function sendVerificationEmail(to: string, code: string) {
  await sendEmail({
    to,
    subject: "İşKalkan — E-posta doğrulama kodun",
    text: `Doğrulama kodun: ${code}\nBu kod 10 dakika geçerlidir.`,
  });
}
