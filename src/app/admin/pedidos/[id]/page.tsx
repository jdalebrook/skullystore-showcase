import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { OrderStatusForm } from "@/components/admin/order-status-form";

type AddressSnapshot = {
  label?: string | null;
  fullName: string;
  line1: string;
  line2?: string | null;
  city: string;
  province?: string | null;
  postalCode: string;
  country: string;
  phone?: string | null;
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: true, items: true, payment: true },
  });

  if (!order) {
    notFound();
  }

  const address = order.addressSnapshot as unknown as AddressSnapshot;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-medium">Pedido {order.id}</h2>
          <p className="text-sm text-muted-foreground">
            {order.user.email} ·{" "}
            {new Intl.DateTimeFormat("es-ES", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(order.createdAt)}
          </p>
        </div>
        <OrderStatusForm orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Artículos
          </h3>
          <ul className="flex flex-col gap-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.nameSnapshot} × {item.quantity}
                </span>
                <span>{formatCents(item.unitPriceCents * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCents(order.subtotalCents)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCents(order.totalCents)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Dirección de envío
          </h3>
          <div className="text-sm">
            {address.label && <p className="font-medium">{address.label}</p>}
            <p>{address.fullName}</p>
            <p>
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
            </p>
            <p>
              {address.postalCode} {address.city}
              {address.province ? `, ${address.province}` : ""}
            </p>
            <p>{address.country}</p>
            {address.phone && <p>{address.phone}</p>}
          </div>

          <h3 className="mt-6 mb-3 text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Pago
          </h3>
          {order.payment ? (
            <div className="text-sm">
              <p>Estado PayPal: {order.payment.status}</p>
              <p className="font-mono text-xs text-muted-foreground">
                Order: {order.payment.paypalOrderId}
              </p>
              {order.payment.paypalCaptureId && (
                <p className="font-mono text-xs text-muted-foreground">
                  Captura: {order.payment.paypalCaptureId}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin información de pago.</p>
          )}
        </div>
      </div>
    </div>
  );
}
