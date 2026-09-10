import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, isAdmin } from "@/lib/auth/guards";
import { setFlag } from "@/lib/services/flags";

const schema = z.object({
  enabled: z.boolean().optional(),
  price: z.number().int().min(0).nullable().optional(),
});

/** PATCH — admin özellik bayrağını aç/kapatır ve fiyatını ayarlar. */
export async function PATCH(req: Request, { params }: { params: { key: string } }) {
  const user = await getSessionUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Doğrulama hatası" }, { status: 422 });

  try {
    const res = await setFlag(params.key, parsed.data);
    return NextResponse.json({ ok: true, ...res });
  } catch {
    return NextResponse.json({ error: "Bilinmeyen özellik." }, { status: 400 });
  }
}
