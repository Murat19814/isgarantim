import { PrismaClient } from "@prisma/client";
import { SERVICE_CATEGORIES, JOB_CATEGORIES } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Kategoriler tohumlanıyor...");

  // Hizmet kategorileri + alt kategoriler
  for (const [i, cat] of SERVICE_CATEGORIES.entries()) {
    const parent = await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, order: i },
      create: { name: cat.name, slug: cat.slug, icon: cat.icon, order: i },
    });

    for (const [j, subName] of cat.sub.entries()) {
      const subSlug = `${cat.slug}-${j}`;
      await prisma.serviceCategory.upsert({
        where: { slug: subSlug },
        update: { name: subName, parentId: parent.id, order: j },
        create: { name: subName, slug: subSlug, parentId: parent.id, order: j },
      });
    }
  }

  // İş ilanı kategorileri (hizmetten ayrı)
  for (const [i, cat] of JOB_CATEGORIES.entries()) {
    await prisma.jobCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, order: i },
      create: { name: cat.name, slug: cat.slug, icon: cat.icon, order: i },
    });
  }

  console.log("✅ Tohumlama tamamlandı.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
