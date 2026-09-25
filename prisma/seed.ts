import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SeedProduct = {
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  priceCents: number;
  stock: number;
  accentColor: string;
  layoutVariant: string;
  badgeText?: string;
  imageSeed: string;
};

type SeedCategory = {
  slug: string;
  name: string;
  description: string;
  products: SeedProduct[];
};

const categories: SeedCategory[] = [
  {
    slug: "ropa",
    name: "Ropa",
    description: "Camisetas y sudaderas de edición propia.",
    products: [
      {
        slug: "camiseta-calavera-flores",
        name: "Camiseta Calavera de Flores",
        shortDesc: "Algodón orgánico, estampado serigrafiado a mano.",
        description:
          "Camiseta de algodón orgánico 100% con estampado serigrafiado a mano. Cada unidad es ligeramente distinta por el proceso artesanal.",
        priceCents: 2495,
        stock: 40,
        accentColor: "#7c3aed",
        layoutVariant: "poster",
        badgeText: "Nuevo",
        imageSeed: "camiseta-calavera-flores",
      },
      {
        slug: "sudadera-gotico-negra",
        name: "Sudadera Gótico Negra",
        shortDesc: "Capucha forrada, corte oversize.",
        description:
          "Sudadera oversize con capucha forrada en polar y bolsillo canguro. Estampado en relieve inspirado en tipografía gótica.",
        priceCents: 4995,
        stock: 25,
        accentColor: "#111827",
        layoutVariant: "default",
        imageSeed: "sudadera-gotico-negra",
      },
    ],
  },
  {
    slug: "accesorios",
    name: "Accesorios",
    description: "Joyería y complementos de diseño propio.",
    products: [
      {
        slug: "anillo-plata-luna",
        name: "Anillo Plata Luna",
        shortDesc: "Plata de ley 925, ajustable.",
        description:
          "Anillo ajustable de plata de ley 925 con motivo lunar grabado a mano. Incluye estuche de regalo.",
        priceCents: 3495,
        stock: 15,
        accentColor: "#94a3b8",
        layoutVariant: "compact",
        badgeText: "Edición limitada",
        imageSeed: "anillo-plata-luna",
      },
      {
        slug: "collar-cuero-colmillo",
        name: "Collar Cuero Colmillo",
        shortDesc: "Cordón de cuero regenerado, colgante de resina.",
        description:
          "Collar con cordón de cuero regenerado y colgante de resina en forma de colmillo. Cierre ajustable.",
        priceCents: 1995,
        stock: 60,
        accentColor: "#78350f",
        layoutVariant: "compact",
        imageSeed: "collar-cuero-colmillo",
      },
    ],
  },
  {
    slug: "decoracion",
    name: "Decoración",
    description: "Piezas para dar carácter a cualquier rincón.",
    products: [
      {
        slug: "figura-resina-calavera",
        name: "Figura de Resina Calavera Floral",
        shortDesc: "Pieza de resina pintada a mano, 18cm.",
        description:
          "Figura decorativa de resina de alta densidad, pintada a mano con acabado mate. Altura 18cm, base incluida.",
        priceCents: 5995,
        stock: 10,
        accentColor: "#be123c",
        layoutVariant: "poster",
        badgeText: "Más vendido",
        imageSeed: "figura-resina-calavera",
      },
      {
        slug: "vela-aromatica-negra",
        name: "Vela Aromática Negra",
        shortDesc: "Cera de soja, aroma sándalo y vainilla.",
        description:
          "Vela artesanal de cera de soja en vaso de vidrio ahumado. Aroma sándalo y vainilla, 40 horas de combustión.",
        priceCents: 1495,
        stock: 80,
        accentColor: "#1c1917",
        layoutVariant: "default",
        imageSeed: "vela-aromatica-negra",
      },
    ],
  },
  {
    slug: "arte",
    name: "Arte",
    description: "Ilustraciones y láminas en edición limitada.",
    products: [
      {
        slug: "lamina-a3-jardin-oscuro",
        name: "Lámina A3 Jardín Oscuro",
        shortDesc: "Impresión giclée en papel 250g.",
        description:
          "Impresión giclée de alta calidad sobre papel de algodón 250g. Numerada y firmada, tirada limitada a 100 unidades.",
        priceCents: 3995,
        stock: 20,
        accentColor: "#166534",
        layoutVariant: "poster",
        imageSeed: "lamina-a3-jardin-oscuro",
      },
    ],
  },
];

async function main() {
  for (const category of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
      },
    });

    for (const product of category.products) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: {
          slug: product.slug,
          name: product.name,
          shortDesc: product.shortDesc,
          description: product.description,
          priceCents: product.priceCents,
          stock: product.stock,
          accentColor: product.accentColor,
          layoutVariant: product.layoutVariant,
          badgeText: product.badgeText,
          categoryId: createdCategory.id,
          images: {
            create: [
              {
                url: `https://picsum.photos/seed/${product.imageSeed}/900/900`,
                alt: product.name,
                isPrimary: true,
                sortOrder: 0,
              },
            ],
          },
        },
      });
    }
  }

  // El admin solo se crea si se pasan credenciales por entorno: nunca hay
  // una contraseña por defecto en el código (el repo es público).
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log(
      "Seed completado. Admin NO creado: define SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD para crearlo."
    );
    return;
  }
  if (adminPassword.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD debe tener al menos 12 caracteres.");
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminPasswordHash,
        name: "Admin",
        role: "ADMIN",
      },
    });
    console.log(`Seed completado. Admin creado: ${adminEmail}`);
  } else {
    console.log("Seed completado. El admin ya existía, no se ha tocado su contraseña.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
