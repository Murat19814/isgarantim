import { NextResponse } from "next/server";
import { z } from "zod";
import { VerificationChannel } from "@prisma/client";
import { confirmVerificationCode } from "@/lib/auth/verification";

const schema = z.object({
  userId: z.string().min(1),
  channel: z.enum(["EMAIL", "PHONE"]),
  code: z.string().length(6),
});

export async function POST(req: Request) {
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
