import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CITIES } from "@/lib/constants";
import { ServiceRequestWizard } from "@/components/service/ServiceRequestWizard";

export const metadata = { title: "Yeni Hizmet Talebi" };

export default async function Page() {
  const parents = await prisma.serviceCategory.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { order: "asc" },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: { id: true, name: true },
      },
    },
  });

  const categories = parents.map((p) => ({
    id: p.id,
    name: p.name,
    children: p.children,
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/panel/hizmet-al"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" /> Taleplerime dön
      </Link>
      <h1 className="mb-6 font-display text-2xl font-extrabold text-navy-900">
        Yeni hizmet talebi
      </h1>
      <ServiceRequestWizard categories={categories} cities={CITIES} />
    </div>
  );
}
