import { NextResponse } from "next/server";
import { z } from "zod";
import { VerificationChannel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { issueVerificationCode } from "@/lib/auth/verification";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  userId: z.string().min(1),
  channel: z.enum(["EMAIL", "PHONE"]),
});

export async function POST(req: Request) {
  const rl = rateLimit(`resend:${clientIp(req)}`, 3, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Çok sık kod istedin. Lütfen biraz bekle." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 422 });
  }

  const { userId, channel } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
  }

  const target = channel === "EMAIL" ? user.email : user.phone;
  if (!target) {
    return NextResponse.json({ error: "Hedef bulunamadı." }, { status: 400 });
  }

  await issueVerificationCode(userId, channel as VerificationChannel, target);
  return NextResponse.json({ ok: true });
}
