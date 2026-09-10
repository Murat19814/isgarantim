import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/guards";
import { setWorkPhotos, WorkPhotoError } from "@/lib/services/serviceRequests";
import { mediaUrl } from "@/lib/validations/common";

const schema = z.object({
  beforePhotos: z.array(mediaUrl).max(8).optional(),
  afterPhotos: z.array(mediaUrl).max(8).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });

  try {
    const res = await setWorkPhotos(user.id, params.id, parsed.data);
    return NextResponse.json({ ok: true, ...res });
  } catch (e) {
    if (e instanceof WorkPhotoError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
