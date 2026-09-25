import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// Crea (o actualiza la contraseña de) un usuario ADMIN, leyendo el email y
// la contraseña de variables de entorno para no dejarlos nunca en el
// código ni en el historial de shell. Uso:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/create-admin.ts

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Define ADMIN_EMAIL y ADMIN_PASSWORD como variables de entorno.");
  }
  if (password.length < 10) {
    throw new Error("La contraseña debe tener al menos 10 caracteres.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { email, passwordHash, role: "ADMIN", name: "Admin" },
  });

  console.log(`Admin listo: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
