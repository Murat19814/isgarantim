import { redirect } from "next/navigation";

export const metadata = { title: "Hizmet Ver" };

/** Herkese açık giriş noktası — hizmet vereni açık talepler / teklif paneline yönlendirir. */
export default function Page() {
  redirect("/panel/hizmet-ver");
}
