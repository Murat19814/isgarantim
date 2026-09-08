import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, isAdmin } from "@/lib/auth/guards";
import { resolveComplaint } from "@/lib/services/admin";

const schema = z.object({ resolved: z.boolean().default(true) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  const resolved = parsed.success ? parsed.data.resolved : true;

  const res = await resolveComplaint(params.id, resolved);
  return NextResponse.json({ ok: true, isResolved: res.isResolved });
}
