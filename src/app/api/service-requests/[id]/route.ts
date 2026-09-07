import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { getRequestWithOffers } from "@/lib/services/serviceRequests";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const request = await getRequestWithOffers(params.id);
  if (!request)
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });

  return NextResponse.json({ data: request });
}
