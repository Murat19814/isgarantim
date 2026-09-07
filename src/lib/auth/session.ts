import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

/** Sunucu bileşenlerinde/aksiyonlarında oturumu getirir. */
export function auth() {
  return getServerSession(authOptions);
}
