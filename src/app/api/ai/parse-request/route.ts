import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/guards";
import { parseRequestText } from "@/lib/services/requestAI";
import { transcribeAudio, aiEnabled } from "@/lib/ai";

const schema = z.object({
  text: z.string().trim().max(2000).optional(),
  voiceUrl: z.string().url().optional(),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });

  let text = parsed.data.text?.trim() ?? "";

  // Sesli talep: AI açıksa kaydı metne çevir
  if (!text && parsed.data.voiceUrl) {
    const t = await transcribeAudio(parsed.data.voiceUrl);
    if (t) text = t.trim();
    else if (!aiEnabled())
      return NextResponse.json(
        { error: "Sesli çözümleme şu an kapalı. Lütfen yazarak anlat." },
        { status: 400 },
      );
  }

  if (text.length < 10)
    return NextResponse.json(
      { error: "Lütfen ihtiyacını biraz daha ayrıntılı anlat." },
      { status: 400 },
    );

  const suggestion = await parseRequestText(text);
  return NextResponse.json({ ok: true, text, suggestion });
}
