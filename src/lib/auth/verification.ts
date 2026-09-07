import { randomInt } from "crypto";
import { VerificationChannel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { sendVerificationEmail } from "@/lib/notify/email";
import { sendVerificationSms } from "@/lib/notify/sms";

const CODE_TTL_MINUTES = 10;

/** 6 haneli rastgele kod üretir. */
function generateCode(): string {
  return randomInt(100000, 1000000).toString();
}

/**
 * Belirtilen kanal için doğrulama kodu üretir, hash'leyerek saklar ve gönderir.
 */
export async function issueVerificationCode(
  userId: string,
  channel: VerificationChannel,
  target: string,
): Promise<void> {
  const code = generateCode();
  const codeHash = await hashPassword(code);
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  // Aynı kanaldaki eski, tüketilmemiş kodları geçersiz kıl
  await prisma.verificationToken.updateMany({
    where: { userId, channel, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  await prisma.verificationToken.create({
    data: { userId, channel, code: codeHash, target, expiresAt },
  });

  if (channel === VerificationChannel.EMAIL) {
    await sendVerificationEmail(target, code);
  } else {
    await sendVerificationSms(target, code);
  }
}

/**
 * Kodu doğrular. Başarılıysa kullanıcının ilgili doğrulama alanını işaretler.
 */
export async function confirmVerificationCode(
  userId: string,
  channel: VerificationChannel,
  code: string,
): Promise<{ ok: boolean; error?: string }> {
  const token = await prisma.verificationToken.findFirst({
    where: { userId, channel, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!token) return { ok: false, error: "Kod bulunamadı, yeniden gönder." };
  if (token.expiresAt < new Date())
    return { ok: false, error: "Kodun süresi doldu, yeniden gönder." };

  const valid = await verifyPassword(code, token.code);
  if (!valid) return { ok: false, error: "Kod hatalı." };

  await prisma.$transaction([
    prisma.verificationToken.update({
      where: { id: token.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data:
        channel === VerificationChannel.EMAIL
          ? { emailVerified: new Date() }
          : { phoneVerified: new Date() },
    }),
  ]);

  return { ok: true };
}
