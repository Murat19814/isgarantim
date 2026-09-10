import { prisma } from "@/lib/prisma";

export type PreferenceInput = {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  newMatch?: boolean;
  workflow?: boolean;
  messages?: boolean;
  marketing?: boolean;
};

const DEFAULTS = {
  emailEnabled: true,
  smsEnabled: false,
  pushEnabled: true,
  newMatch: true,
  workflow: true,
  messages: true,
  marketing: false,
};

/** Tercihleri getirir; yoksa varsayılanlarla döner (kayıt oluşturmaz). */
export async function getPreferences(userId: string) {
  const pref = await prisma.notificationPreference.findUnique({ where: { userId } });
  return pref ?? { userId, ...DEFAULTS };
}

/** Tercihleri oluştur/günceller (upsert). */
export async function updatePreferences(userId: string, input: PreferenceInput) {
  const data = {
    emailEnabled: input.emailEnabled ?? DEFAULTS.emailEnabled,
    smsEnabled: input.smsEnabled ?? DEFAULTS.smsEnabled,
    pushEnabled: input.pushEnabled ?? DEFAULTS.pushEnabled,
    newMatch: input.newMatch ?? DEFAULTS.newMatch,
    workflow: input.workflow ?? DEFAULTS.workflow,
    messages: input.messages ?? DEFAULTS.messages,
    marketing: input.marketing ?? DEFAULTS.marketing,
  };
  return prisma.notificationPreference.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
    select: { id: true },
  });
}
