import { NextResponse } from "next/server";
import { z } from "zod";
import { ProblemStatus } from "@prisma/client";
import { getSessionUser, isAdmin } from "@/lib/auth/guards";
import { updateProblemReport } from "@/lib/services/admin";

const schema = z.object({
  status: z.nativeEnum(ProblemStatus),
  adminNote: z.string().max(2000).optional(),
});

/** PATCH — admin sorun bildirimini günceller (durum + not). */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Doğrulama hatası" }, { status: 422 });
  }

  const res = await updateProblemReport(params.id, parsed.data.status, parsed.data.adminNote);
  return NextResponse.json({ ok: true, status: res.status });
}
