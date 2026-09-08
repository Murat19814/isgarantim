import { NextResponse } from "next/server";
import { JobApplicationStatus } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/guards";
import { applicationStatusSchema } from "@/lib/validations/jobs";
import { updateApplicationStatus, JobError } from "@/lib/services/jobs";

/** POST — başvuru durumunu güncelle (ilan sahibi). */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = applicationStatusSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json({ error: "Geçersiz durum." }, { status: 422 });

  try {
    await updateApplicationStatus(
      user.id,
      params.id,
      parsed.data.status as JobApplicationStatus,
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof JobError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
