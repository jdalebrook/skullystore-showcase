import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: "test@skullystore.dev" },
  });
  const address = await prisma.address.findFirstOrThrow({ where: { userId: user.id } });
  const product = await prisma.product.findFirstOrThrow();

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: "PAID",
      subtotalCents: product.priceCents * 2,
      totalCents: product.priceCents * 2,
      addressSnapshot: {
        label: address.label,
        fullName: address.fullName,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
      },
      items: {
        create: [
          {
            productId: product.id,
            nameSnapshot: product.name,
            unitPriceCents: product.priceCents,
            quantity: 2,
          },
        ],
      },
      payment: {
        create: {
          paypalOrderId: `TEST-${Date.now()}`,
          paypalCaptureId: `CAPTURE-${Date.now()}`,
          status: "COMPLETED",
        },
      },
    },
  });

  console.log(JSON.stringify({ orderId: order.id }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
