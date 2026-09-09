import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guards";
import { listNotifications } from "@/lib/services/notifications";

/** GET — kullanıcının bildirimleri + okunmamış sayısı. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });

  const { items, unread } = await listNotifications(user.id);
  return NextResponse.json({ unread, items });
}
