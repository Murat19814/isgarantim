import { redirect } from "next/navigation";

export const metadata = { title: "Hizmet Al" };

/** Herkese açık giriş noktası — müşteriyi hizmet talebi oluşturma akışına yönlendirir. */
export default function Page() {
  redirect("/panel/hizmet-al/yeni");
}
