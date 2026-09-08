import { NextResponse } from "next/server";
import { z } from "zod";
import { VerificationChannel } from "@prisma/client";
import { confirmVerificationCode } from "@/lib/auth/verification";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  userId: z.string().min(1),
  channel: z.enum(["EMAIL", "PHONE"]),
  code: z.string().length(6),
});

export async function POST(req: Request) {
  // Kod deneme (brute-force) sınırı: IP başına 10 dk'da 15 deneme.
  const rl = rateLimit(`verify:${clientIp(req)}`, 15, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Çok fazla hatalı deneme. Lütfen biraz bekle." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 422 });
  }

  const { userId, channel, code } = parsed.data;
  const result = await confirmVerificationCode(
    userId,
    channel as VerificationChannel,
    code,
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
