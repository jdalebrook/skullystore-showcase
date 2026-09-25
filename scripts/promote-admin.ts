import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Da (o mantiene) el rol ADMIN a un usuario por email. Si no existe todavía,
// lo crea sin passwordHash -- solo podrá entrar por Google hasta que fije
// una contraseña (recuperar contraseña). Uso:
//   ADMIN_EMAIL=alguien@gmail.com npx tsx scripts/promote-admin.ts

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    throw new Error("Define ADMIN_EMAIL como variable de entorno.");
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: { email, role: "ADMIN" },
  });

  console.log(`${user.email} ahora tiene rol ADMIN (id: ${user.id}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
