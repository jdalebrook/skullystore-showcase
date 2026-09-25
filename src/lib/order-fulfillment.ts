import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendNewOrderAdminNotification } from "@/lib/email";

type CaptureData = {
  status: string;
  captureId?: string;
  rawPayload: unknown;
};

// Compartido entre captureOrder() (captura síncrona, iniciada desde el
// navegador tras aprobar el pago) y el webhook de PayPal
// (PAYMENT.CAPTURE.COMPLETED, red de seguridad por si la respuesta de la
// captura síncrona nunca llega -- corte de red, pestaña cerrada...). Ambas
// vías pueden llegar a marcar el mismo pedido como pagado, así que esto
// tiene que ser idempotente.
export async function fulfillPaidOrder(paymentId: string, capture: CaptureData) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: { include: { user: true } } },
  });
  if (!payment) return;

  // Guarda atómica: solo "gana" la primera llamada que consiga pasar el
  // pedido de "no pagado" a PAID. Si otra vía ya lo hizo antes (captura
  // síncrona y webhook casi a la vez, o dos entregas duplicadas del mismo
  // webhook -- PayPal a veces reenvía el mismo evento), count será 0 y se
  // corta aquí sin repetir el descuento de stock ni los emails.
  const { count } = await prisma.order.updateMany({
    where: { id: payment.orderId, status: { not: "PAID" } },
    data: { status: "PAID" },
  });
  if (count === 0) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: capture.status,
      paypalCaptureId: capture.captureId,
      rawPayload: capture.rawPayload as never,
    },
  });
  await prisma.cart.deleteMany({ where: { userId: payment.order.userId } });

  const orderItems = await prisma.orderItem.findMany({ where: { orderId: payment.orderId } });
  await prisma.$transaction(
    orderItems.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    )
  );

  // Un fallo al enviar el email no debe romper la confirmación del pedido --
  // el pago ya está capturado, eso no puede depender de que salga un email.
  const customerEmail = payment.order.user.email;
  if (customerEmail) {
    try {
      await sendOrderConfirmationEmail(customerEmail, {
        id: payment.orderId,
        totalCents: payment.order.totalCents,
        items: orderItems,
        address: payment.order.addressSnapshot as {
          fullName: string;
          line1: string;
          line2?: string | null;
          city: string;
          province?: string | null;
          postalCode: string;
          country: string;
        },
      });
    } catch (error) {
      console.error(`No se pudo enviar el email de confirmación del pedido ${payment.orderId}:`, error);
    }
  }

  try {
    await sendNewOrderAdminNotification(customerEmail ?? "(sin email)", {
      id: payment.orderId,
      totalCents: payment.order.totalCents,
      items: orderItems,
    });
  } catch (error) {
    console.error(`No se pudo enviar el aviso de pedido nuevo al admin (${payment.orderId}):`, error);
  }
}
