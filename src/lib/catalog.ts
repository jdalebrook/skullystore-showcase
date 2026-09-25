import { prisma } from "@/lib/prisma";

// Oculta categorías sin ningún producto visible en vez de mostrar un enlace
// a una página vacía -- reaparecen solas en cuanto tengan al menos un
// producto activo, sin tocar nada más.
export function getTopLevelCategories() {
  return prisma.category.findMany({
    where: { parentId: null, products: { some: { isActive: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
  });
}

export function getProductsByCategoryId(categoryId: string) {
  return prisma.product.findMany({
    where: { categoryId, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      _count: { select: { likes: true } },
    },
  });
}

// Para el carrusel principal: primero los más gustados, y como el número de
// likes empieza en 0 para todos, el segundo criterio (más recientes) es lo
// que llena el carrusel de forma natural mientras no haya likes todavía.
export function getFeaturedProducts(take = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
    take,
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      _count: { select: { likes: true } },
    },
  });
}

export async function getLikedProductIds(
  userId: string | undefined,
  productIds: string[]
): Promise<Set<string>> {
  if (!userId || productIds.length === 0) return new Set();

  const likes = await prisma.productLike.findMany({
    where: { userId, productId: { in: productIds } },
    select: { productId: true },
  });

  return new Set(likes.map((like) => like.productId));
}
