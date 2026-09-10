import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/guards";
import { detectFromPhoto } from "@/lib/services/requestAI";

const schema = z.object({ imageUrl: z.string().url() });

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Geçersiz görsel." }, { status: 400 });

  const result = await detectFromPhoto(parsed.data.imageUrl);
  if (!result)
    return NextResponse.json(
      { error: "Fotoğraftan tespit şu an kapalı. Lütfen ihtiyacını yazarak anlat." },
      { status: 400 },
    );

  return NextResponse.json({ ok: true, detection: result });
}
