import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { listApplicationsForPosting, JobError } from "@/lib/services/jobs";

/** GET — ilana gelen başvurular (yalnızca ilan sahibi). */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  try {
    const applications = await listApplicationsForPosting(user.id, params.id);
    return NextResponse.json({ applications });
  } catch (e) {
    if (e instanceof JobError)
      return NextResponse.json({ error: e.message }, { status: 403 });
    throw e;
  }
}
