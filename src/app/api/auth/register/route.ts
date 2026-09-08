import { NextResponse } from "next/server";
import { UserRole, VerificationChannel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema, normalizePhone } from "@/lib/validations/auth";
import { issueVerificationCode } from "@/lib/auth/verification";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimit(`register:${clientIp(req)}`, 5, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Çok fazla deneme. Lütfen biraz sonra tekrar dene." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { fullName, email, phone, password, roles } = parsed.data;
  const normEmail = email.toLowerCase();
  const normPhone = normalizePhone(phone);

  // Benzersizlik kontrolü
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: normEmail }, { phone: normPhone }] },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Bu e-posta veya telefon zaten kayıtlı." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const roleEnums = roles as UserRole[];

  const user = await prisma.user.create({
    data: {
      fullName,
      email: normEmail,
      phone: normPhone,
      passwordHash,
      roles: roleEnums,
      // Her kullanıcıya kontör cüzdanı aç (hizmet verenler için kullanılır)
      creditWallet: { create: {} },
      // Hizmet veren rolü varsa profil oluştur
      ...(roleEnums.includes("PROVIDER")
        ? { providerProfile: { create: {} } }
        : {}),
    },
  });

  // Doğrulama kodlarını gönder (e-posta + telefon)
  await Promise.all([
    issueVerificationCode(user.id, VerificationChannel.EMAIL, normEmail),
    issueVerificationCode(user.id, VerificationChannel.PHONE, normPhone),
  ]);

  return NextResponse.json(
    {
      ok: true,
      userId: user.id,
      message: "Kayıt başarılı. E-posta ve telefonuna doğrulama kodu gönderildi.",
    },
    { status: 201 },
  );
}
