import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, isAdmin } from "@/lib/auth/guards";
import { setReviewHidden } from "@/lib/services/reviews";

const schema = z.object({ hidden: z.boolean() });

/** PATCH — admin şikayet edilen yorumu gizler/gösterir. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Doğrulama hatası" }, { status: 422 });

  const res = await setReviewHidden(params.id, parsed.data.hidden);
  return NextResponse.json({ ok: true, isHidden: res.isHidden });
}
