import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { jobApplicationSchema } from "@/lib/validations/jobs";
import { applyToJob, JobError } from "@/lib/services/jobs";

/** POST — ilana başvur. */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = jobApplicationSchema.safeParse(await req.json().catch(() => ({})));
  const coverLetter = parsed.success ? parsed.data.coverLetter : undefined;

  try {
    const app = await applyToJob(user.id, params.id, coverLetter);
    return NextResponse.json({ ok: true, id: app.id }, { status: 201 });
  } catch (e) {
    if (e instanceof JobError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
