import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "@/components/checkout/checkout-client";

export default async function CheckoutPage() {
  const user = await requireUser();

  const [cart, addresses] = await Promise.all([
    prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: { include: { images: true } } } } },
    }),
    prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activeItems = (cart?.items ?? []).filter((item) => item.product.isActive);

  if (activeItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-semibold">
          Tu carrito está vacío
        </h1>
        <p className="mt-2 text-muted-foreground">
          Añade productos antes de finalizar la compra.
        </p>
      </div>
    );
  }

  const items = activeItems.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    priceCents: item.product.priceCents,
    quantity: item.quantity,
  }));

  const totalCents = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Finalizar compra
      </h1>
      <div className="mt-8">
        <CheckoutClient addresses={addresses} items={items} totalCents={totalCents} />
      </div>
    </div>
  );
}
