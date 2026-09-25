import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";

export default async function OrdersPage() {
  const user = await requireUser();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no tienes pedidos.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {orders.map((order) => (
        <li
          key={order.id}
          className="flex items-center justify-between rounded-lg border border-border p-4 text-sm"
        >
          <span>{order.id}</span>
          <span>{order.status}</span>
          <span>{formatCents(order.totalCents)}</span>
        </li>
      ))}
    </ul>
  );
}
