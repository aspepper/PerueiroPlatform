import { prisma } from "../src/lib/prisma";
import { resolvePasswordHash } from "../src/lib/password";

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@perueiros.local";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hash = await resolvePasswordHash(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash, role: "ADMIN" },
    create: { email, password: hash, role: "ADMIN", name: "Administrador" }
  });
  console.log("Seeded admin:", user.email);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
