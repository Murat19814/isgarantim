import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HowItWorks } from "@/components/HowItWorks";

export const metadata = { title: "Nasıl Çalışır?" };

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
