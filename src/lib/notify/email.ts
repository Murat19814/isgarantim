/**
 * E-posta gönderimi (SMTP / nodemailer).
 *
 * SMTP_HOST tanımlı DEĞİLSE: geliştirme modunda konsola yazar (no-op).
 * SMTP_HOST tanımlıysa: nodemailer ile gerçek SMTP üzerinden gönderir.
 *
 * Gmail için önerilen değerler (.env):
 *   SMTP_HOST="smtp.gmail.com"
 *   SMTP_PORT="465"            # 465 = SSL, 587 = STARTTLS
 *   SMTP_USER="hesap@gmail.com"
 *   SMTP_PASS="uygulama-sifresi (16 haneli app password)"
 *   MAIL_FROM="İşKalkan <no-reply@isgarantim.com>"
 */
import nodemailer, { type Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!process.env.SMTP_HOST) return null;
  if (cachedTransporter) return cachedTransporter;

  const port = Number(process.env.SMTP_PORT || 587);
  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 için TLS/SSL, diğerlerinde STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return cachedTransporter;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const transporter = getTransporter();

  if (!transporter) {
    // SMTP yapılandırılmadı — geliştirmede konsola yaz.
    console.log(
      `\n📧 [DEV E-POSTA] → ${opts.to}\n   Konu: ${opts.subject}\n   ${opts.text}\n`,
    );
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
  } catch (e) {
    console.error("[email] SMTP gönderimi başarısız:", e);
    throw e;
  }
}

/** Marka temalı HTML doğrulama e-postası. */
function verificationHtml(code: string): string {
  return `
  <div style="max-width:480px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px;border-radius:16px;border:1px solid #e2e8f0;">
    <div style="text-align:center;padding:8px 0 16px;">
      <span style="font-size:22px;font-weight:800;color:#0f172a;">İş<span style="color:#059669;">Kalkan</span></span>
    </div>
    <div style="background:#ffffff;border-radius:12px;padding:24px;text-align:center;">
      <p style="color:#334155;font-size:15px;margin:0 0 12px;">E-posta doğrulama kodun:</p>
      <div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#0f172a;margin:8px 0 16px;">${code}</div>
      <p style="color:#64748b;font-size:13px;margin:0;">Bu kod 10 dakika geçerlidir. Bu talebi sen yapmadıysan bu e-postayı yok sayabilirsin.</p>
    </div>
    <p style="color:#94a3b8;font-size:11px;text-align:center;margin:16px 0 0;">© ${new Date().getFullYear()} İşKalkan · isgarantim.com</p>
  </div>`;
}

export async function sendVerificationEmail(to: string, code: string) {
  await sendEmail({
    to,
    subject: `İşKalkan — E-posta doğrulama kodun: ${code}`,
    text: `Doğrulama kodun: ${code}\nBu kod 10 dakika geçerlidir.`,
    html: verificationHtml(code),
  });
}
