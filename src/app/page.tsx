import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Year1Banner } from "@/components/Year1Banner";
import { EntryCards } from "@/components/EntryCards";
import { Stats } from "@/components/Stats";
import { Categories } from "@/components/Categories";
import { HowItWorks } from "@/components/HowItWorks";
import { VerifiedProviders } from "@/components/VerifiedProviders";
import { LatestJobs } from "@/components/LatestJobs";
import { CtaMobile } from "@/components/CtaMobile";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Year1Banner />
        <EntryCards />
        <Stats />
        <Categories />
        <HowItWorks />
        <VerifiedProviders />
        <LatestJobs />
        <CtaMobile />
      </main>
      <Footer />
    </>
  );
}
