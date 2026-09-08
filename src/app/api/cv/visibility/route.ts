import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/guards";
import { setCVVisibility } from "@/lib/services/cv";

const schema = z.object({ isVisible: z.boolean() });

/** POST — CV görünürlüğünü aç/kapat. */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 422 });

  try {
    const cv = await setCVVisibility(user.id, parsed.data.isVisible);
    return NextResponse.json({ ok: true, isVisible: cv.isVisible });
  } catch {
    return NextResponse.json(
      { error: "Önce CV oluşturmalısın." },
      { status: 400 },
    );
  }
}
