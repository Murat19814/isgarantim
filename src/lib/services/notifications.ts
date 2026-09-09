import { prisma } from "@/lib/prisma";

export type NotificationData = {
  type: string;
  title: string;
  body?: string;
  link?: string;
};

/**
 * Tek kullanıcıya bildirim oluşturur.
 * ÖNEMLİ: Asla hata fırlatmaz — bildirim, çağrıldığı ana iş akışını (ödeme,
 * teklif, mesaj vb.) bozmamalı. Hata olursa sadece loglanır.
 */
export async function notify(userId: string, data: NotificationData) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        body: data.body ?? null,
        link: data.link ?? null,
      },
    });
  } catch (e) {
    console.error("[notify] başarısız:", e);
  }
}

/** Birden fazla kullanıcıya aynı bildirim (tekilleştirilir). */
export async function notifyMany(userIds: string[], data: NotificationData) {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return;
  try {
    await prisma.notification.createMany({
      data: unique.map((userId) => ({
        userId,
        type: data.type,
        title: data.title,
        body: data.body ?? null,
        link: data.link ?? null,
      })),
    });
  } catch (e) {
    console.error("[notifyMany] başarısız:", e);
  }
}

/** Kullanıcının bildirimleri + okunmamış sayısı. */
export async function listNotifications(userId: string, take = 20) {
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { items, unread };
}

/** Tümünü okundu işaretle. */
export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

/** Tek bildirimi okundu işaretle (sahiplik kontrollü). */
export async function markRead(userId: string, id: string) {
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}
