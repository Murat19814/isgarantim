import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, isAdmin } from "@/lib/auth/guards";
import { createCategory, toggleCategory, AdminError } from "@/lib/services/admin";

const createSchema = z.object({
  kind: z.enum(["service", "job"]),
  name: z.string().min(2).max(80),
});

const toggleSchema = z.object({
  kind: z.enum(["service", "job"]),
  id: z.string().min(1),
  isActive: z.boolean(),
});

/** POST — yeni kategori oluştur. */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek." }, { status: 422 });

  try {
    const cat = await createCategory(parsed.data.kind, parsed.data.name);
    return NextResponse.json({ ok: true, id: cat.id }, { status: 201 });
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}

/** PATCH — kategori aktif/pasif. */
export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const parsed = toggleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek." }, { status: 422 });

  const res = await toggleCategory(parsed.data.kind, parsed.data.id, parsed.data.isActive);
  return NextResponse.json({ ok: true, isActive: res.isActive });
}
