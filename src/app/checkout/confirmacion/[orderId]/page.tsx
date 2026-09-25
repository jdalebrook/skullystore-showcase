import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { PurchaseTracker } from "@/components/purchase-tracker";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const user = await requireUser();

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      {order.status === "PAID" && (
        <PurchaseTracker orderId={order.id} totalCents={order.totalCents} items={order.items} />
      )}

      <h1 className="font-heading text-2xl font-semibold">
        ¡Gracias por tu compra!
      </h1>
      <p className="mt-2 text-muted-foreground">
        Pedido #{order.id} — estado: {order.status}
      </p>

      <ul className="mt-8 flex flex-col gap-3">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm">
            <span>
              {item.nameSnapshot} × {item.quantity}
            </span>
            <span>{formatCents(item.unitPriceCents * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold">
        <span>Total</span>
        <span>{formatCents(order.totalCents)}</span>
      </div>
    </div>
  );
}
