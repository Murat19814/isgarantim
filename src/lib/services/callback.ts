import { prisma } from "@/lib/prisma";
import { notifyMany } from "@/lib/services/notifications";
import type { CallbackInput } from "@/lib/validations/service";

export class CallbackError extends Error {}

const VALID_STATUS = ["NEW", "CONTACTED", "DONE", "CANCELLED"] as const;
export type CallbackStatus = (typeof VALID_STATUS)[number];

/** "Beni arayın" talebi oluştur. Girişli kullanıcıysa createdById bağlanır. */
export async function createCallback(input: CallbackInput, createdById?: string | null) {
  const cb = await prisma.callbackRequest.create({
    data: {
      name: input.name.trim(),
      phone: input.phone.trim(),
      topic: input.topic || null,
      city: input.city || null,
      createdById: createdById || null,
    },
    select: { id: true },
  });

  // Adminlere bildir (hata güvenli).
  try {
    const admins = await prisma.user.findMany({
      where: { roles: { has: "ADMIN" } },
      select: { id: true },
    });
    if (admins.length > 0) {
      await notifyMany(
        admins.map((a) => a.id),
        {
          type: "CALLBACK_REQUEST",
          title: "📞 Yeni 'Beni arayın' talebi",
          body: `${input.name} — ${input.phone}${input.topic ? ` · ${input.topic}` : ""}`,
          link: "/admin/beni-arayin",
        },
      );
    }
  } catch {
    // yut
  }

  return cb;
}

/** Admin: geri arama taleplerini listele. */
export async function listCallbacks() {
  return prisma.callbackRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 300,
    include: {
      createdBy: { select: { id: true, fullName: true } },
      handledBy: { select: { id: true, fullName: true } },
    },
  });
}

/** Admin/operatör: talebin durumunu güncelle. */
export async function updateCallback(
  id: string,
  status: string,
  handledById: string,
  adminNote?: string,
) {
  if (!VALID_STATUS.includes(status as CallbackStatus)) {
    throw new CallbackError("Geçersiz durum.");
  }
  return prisma.callbackRequest.update({
    where: { id },
    data: {
      status,
      adminNote: adminNote ?? undefined,
      handledById,
    },
    select: { id: true, status: true },
  });
}
