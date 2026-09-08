import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { interviewInvitationSchema } from "@/lib/validations/jobs";
import { inviteCandidate, JobError } from "@/lib/services/jobs";

/** POST — adaya görüşme daveti gönder (ilan sahibi). */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = interviewInvitationSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 422 });

  try {
    const inv = await inviteCandidate(
      user.id,
      params.id,
      parsed.data.candidateId,
      parsed.data.message,
      parsed.data.proposedAt,
    );
    return NextResponse.json({ ok: true, id: inv.id }, { status: 201 });
  } catch (e) {
    if (e instanceof JobError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
