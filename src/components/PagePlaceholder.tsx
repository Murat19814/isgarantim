import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Construction, ArrowLeft } from "lucide-react";

export function PagePlaceholder({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <>
      <Navbar />
      <main className="container-page grid min-h-[60vh] place-items-center py-20">
        <div className="max-w-lg text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Construction className="h-8 w-8" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-extrabold text-navy-900">
            {title}
          </h1>
          <p className="mt-3 text-navy-500">{description}</p>
          <span className="badge-gold mt-4">{phase}</span>
          <div className="mt-8">
            <Link href="/" className="btn-outline">
              <ArrowLeft className="h-4 w-4" /> Ana sayfaya dön
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
