import { NextResponse } from "next/server";
import { z } from "zod";
import { JobPostingStatus } from "@prisma/client";
import { getSessionUser, isAdmin } from "@/lib/auth/guards";
import { setJobPostingStatus } from "@/lib/services/admin";

const schema = z.object({
  status: z.enum(["DRAFT", "PENDING_PAYMENT", "ACTIVE", "PAUSED", "EXPIRED", "CLOSED"]),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!isAdmin(user)) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz durum." }, { status: 422 });

  const res = await setJobPostingStatus(params.id, parsed.data.status as JobPostingStatus);
  return NextResponse.json({ ok: true, status: res.status });
}
