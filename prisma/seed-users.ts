import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Tüm test hesaplarının ortak şifresi. */
const PASSWORD = "Test1234!";

const USERS: { email: string; fullName: string; roles: UserRole[] }[] = [
  {
    email: "admin@isgarantim.com",
    fullName: "Admin Kullanıcı",
    // Admin her paneli görebilsin diye tüm roller
    roles: [
      UserRole.ADMIN,
      UserRole.CUSTOMER,
      UserRole.PROVIDER,
      UserRole.JOBSEEKER,
      UserRole.EMPLOYER,
    ],
  },
  { email: "musteri@isgarantim.com", fullName: "Test Müşteri", roles: [UserRole.CUSTOMER] },
  { email: "usta@isgarantim.com", fullName: "Test Usta", roles: [UserRole.PROVIDER] },
  { email: "isarayan@isgarantim.com", fullName: "Test İş Arayan", roles: [UserRole.JOBSEEKER] },
  { email: "isveren@isgarantim.com", fullName: "Test İşveren", roles: [UserRole.EMPLOYER] },
];

async function main() {
  console.log("👤 Test hesapları oluşturuluyor...\n");
  const now = new Date();
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        roles: u.roles,
        passwordHash,
        isActive: true,
        isBanned: false,
        emailVerified: now,
        phoneVerified: now,
      },
      create: {
        email: u.email,
        fullName: u.fullName,
        roles: u.roles,
        passwordHash,
        isActive: true,
        emailVerified: now,
        phoneVerified: now,
      },
    });

    // Hizmet veren rolü olanlara başlangıç kontörü ver (teklif verebilmek için)
    if (u.roles.includes(UserRole.PROVIDER)) {
      await prisma.creditWallet.upsert({
        where: { userId: user.id },
        update: { balance: 100 },
        create: { userId: user.id, balance: 100 },
      });
    }

    console.log(`  ✔ ${u.email.padEnd(26)} → ${u.roles.join(", ")}`);
  }

  console.log(`\n🔑 Ortak şifre: ${PASSWORD}`);
  console.log("✅ Test hesapları hazır.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
