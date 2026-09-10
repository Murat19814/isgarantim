import { NextResponse } from "next/server";
import { z } from "zod";
import { VerificationStatus } from "@prisma/client";
import { getSessionUser, isAdmin } from "@/lib/auth/guards";
import { reviewVerification } from "@/lib/services/verification";

const schema = z.object({
  status: z.nativeEnum(VerificationStatus),
  adminNote: z.string().max(1000).optional(),
});

/** PATCH — admin doğrulama başvurusunu onaylar/reddeder. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Doğrulama hatası" }, { status: 422 });
  }

  const res = await reviewVerification(params.id, user!.id, parsed.data.status, parsed.data.adminNote);
  return NextResponse.json({ ok: true, status: res.status });
}
