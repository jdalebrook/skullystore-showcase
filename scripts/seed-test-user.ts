import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("Test123456!", 12);

  const user = await prisma.user.upsert({
    where: { email: "test@skullystore.dev" },
    update: { passwordHash },
    create: {
      email: "test@skullystore.dev",
      passwordHash,
      name: "Usuaria de Prueba",
    },
  });

  const address = await prisma.address.upsert({
    where: { id: "test-address-seed" },
    update: {},
    create: {
      id: "test-address-seed",
      userId: user.id,
      fullName: "Usuaria de Prueba",
      line1: "Calle Falsa 123",
      city: "Madrid",
      postalCode: "28001",
      country: "ES",
    },
  });

  const product = await prisma.product.findFirstOrThrow();

  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId: product.id } },
    update: { quantity: 2 },
    create: { cartId: cart.id, productId: product.id, quantity: 2 },
  });

  console.log(JSON.stringify({ userId: user.id, addressId: address.id, productId: product.id }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
