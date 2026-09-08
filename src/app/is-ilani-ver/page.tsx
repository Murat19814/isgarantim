import { redirect } from "next/navigation";

export const metadata = { title: "İş İlanı Ver" };

/** Herkese açık giriş noktası — işvereni firma/ilan paneline yönlendirir. */
export default function Page() {
  redirect("/panel/isveren");
}
