"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function syncServerCart(
  items: { productId: string; quantity: number }[]
): Promise<{ removedProductIds: string[] }> {
  const user = await requireUser();

  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  const requestedItems = items.filter((item) => item.quantity > 0);

  // El carrito del cliente vive en localStorage y puede referenciar un
  // producto que ya no existe (borrado) o que se ha desactivado -- filtrar
  // antes de escribir, si no la violación de la FK rompe el checkout entero
  // con un 500 en vez de simplemente ignorar lo que ya no es válido.
  const existingProducts = await prisma.product.findMany({
    where: {
      id: { in: requestedItems.map((item) => item.productId) },
      isActive: true,
    },
    select: { id: true },
  });
  const existingProductIds = new Set(existingProducts.map((product) => product.id));

  const validItems = requestedItems.filter((item) => existingProductIds.has(item.productId));
  const removedProductIds = requestedItems
    .filter((item) => !existingProductIds.has(item.productId))
    .map((item) => item.productId);

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
    ...validItems.map((item) =>
      prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity,
        },
      })
    ),
  ]);

  return { removedProductIds };
}
