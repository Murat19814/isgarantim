import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/guards";
import { setPostingHighlight, JobError } from "@/lib/services/jobs";

const schema = z.object({
  featured: z.boolean().optional(),
  urgent: z.boolean().optional(),
});

/** PATCH — işveren ilanını öne çıkarır / acil işaretler (özellik bayrağına bağlı). */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Doğrulama hatası" }, { status: 422 });

  try {
    const res = await setPostingHighlight(user.id, params.id, parsed.data);
    return NextResponse.json({ ok: true, ...res });
  } catch (e) {
    if (e instanceof JobError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
