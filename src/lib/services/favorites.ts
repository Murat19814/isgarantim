import { prisma } from "@/lib/prisma";

export class FavoriteError extends Error {}

/** Favoriye ekle/çıkar (toggle). Kendini favoriye ekleyemez. */
export async function toggleFavorite(userId: string, providerId: string) {
  if (userId === providerId)
    throw new FavoriteError("Kendini favorilere ekleyemezsin.");

  const existing = await prisma.favorite.findUnique({
    where: { userId_providerId: { userId, providerId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { favorited: false };
  }

  await prisma.favorite.create({ data: { userId, providerId } });
  return { favorited: true };
}

/** Kullanıcı bu hizmet vereni favorilemiş mi? */
export async function isFavorited(userId: string, providerId: string) {
  const f = await prisma.favorite.findUnique({
    where: { userId_providerId: { userId, providerId } },
    select: { id: true },
  });
  return !!f;
}

/** Kullanıcının favori hizmet verenleri (profil özetiyle). */
export async function listFavorites(userId: string) {
  const favs = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      provider: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          isFounder: true,
          providerProfile: {
            select: {
              headline: true,
              city: true,
              ratingAvg: true,
              ratingCount: true,
              completedJobs: true,
              categories: { select: { id: true, name: true }, take: 1 },
            },
          },
        },
      },
    },
  });
  return favs.map((f) => f.provider);
}
