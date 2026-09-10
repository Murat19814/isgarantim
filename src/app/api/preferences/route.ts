import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/guards";
import { updatePreferences } from "@/lib/services/preferences";

const schema = z.object({
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  newMatch: z.boolean().optional(),
  workflow: z.boolean().optional(),
  messages: z.boolean().optional(),
  marketing: z.boolean().optional(),
});

/** PATCH — bildirim tercihlerini kaydeder. */
export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Doğrulama hatası" }, { status: 422 });

  await updatePreferences(user.id, parsed.data);
  return NextResponse.json({ ok: true });
}
