import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { problemReportSchema } from "@/lib/validations/service";
import { reportProblem, WorkflowError } from "@/lib/services/workflow";

/** POST — taraflardan biri sorun bildirir. */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const parsed = problemReportSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const result = await reportProblem(user.id, params.id, parsed.data);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof WorkflowError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
