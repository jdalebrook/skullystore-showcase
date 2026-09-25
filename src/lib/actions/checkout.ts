"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createPayPalOrder, capturePayPalOrder } from "@/lib/paypal";
import { fulfillPaidOrder } from "@/lib/order-fulfillment";
import { rateLimit } from "@/lib/rate-limit";

type CreateOrderResult =
  | { error: string; orderId?: undefined; paypalOrderId?: undefined }
  | { error?: undefined; orderId: string; paypalOrderId: string };

export async function createOrderFromCart(addressId: string): Promise<CreateOrderResult> {
  const user = await requireUser();

  const { allowed } = rateLimit(`checkout-create:${user.id}`, 10, 15 * 60 * 1000);
  if (!allowed) {
    return { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
  }

  const [cart, address] = await Promise.all([
    prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    }),
    prisma.address.findFirst({
      where: { id: addressId, userId: user.id },
    }),
  ]);

  if (!cart || cart.items.length === 0) {
    return { error: "Tu carrito está vacío." };
  }
  if (!address) {
    return { error: "Selecciona una dirección de envío válida." };
  }

  const activeItems = cart.items.filter((item) => item.product.isActive);
  if (activeItems.length === 0) {
    return { error: "Los productos de tu carrito ya no están disponibles." };
  }

  // Nunca se confía en que el carrito (sincronizado hace un rato) siga
  // reflejando el stock real -- se relee aquí, justo antes de crear el
  // pedido, igual que ya se relee el precio.
  const insufficientStockItems = activeItems.filter(
    (item) => item.quantity > item.product.stock
  );
  if (insufficientStockItems.length > 0) {
    const names = insufficientStockItems.map((item) => item.product.name).join(", ");
    return {
      error: `No hay stock suficiente para: ${names}. Ajusta las cantidades en el carrito.`,
    };
  }

  const totalCents = activeItems.reduce(
    (sum, item) => sum + item.product.priceCents * item.quantity,
    0
  );
  const currency = activeItems[0].product.currency;

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      subtotalCents: totalCents,
      totalCents,
      currency,
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
        create: activeItems.map((item) => ({
          productId: item.productId,
          nameSnapshot: item.product.name,
          unitPriceCents: item.product.priceCents,
          quantity: item.quantity,
        })),
      },
    },
  });

  const paypalOrder = await createPayPalOrder(totalCents, currency);

  await prisma.payment.create({
    data: {
      orderId: order.id,
      paypalOrderId: paypalOrder.id,
      status: "CREATED",
    },
  });

  return { orderId: order.id, paypalOrderId: paypalOrder.id };
}

type CaptureOrderResult = { error: string; orderId?: undefined } | { error?: undefined; orderId: string };

export async function captureOrder(paypalOrderId: string): Promise<CaptureOrderResult> {
  const user = await requireUser();

  const { allowed } = rateLimit(`checkout-capture:${user.id}`, 10, 15 * 60 * 1000);
  if (!allowed) {
    return { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
  }

  const payment = await prisma.payment.findUnique({
    where: { paypalOrderId },
    include: { order: true },
  });

  if (!payment || payment.order.userId !== user.id) {
    return { error: "Pedido no encontrado." };
  }

  const capture = await capturePayPalOrder(paypalOrderId);
  const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id as
    | string
    | undefined;

  // fulfillPaidOrder es idempotente -- si el webhook de PayPal
  // (PAYMENT.CAPTURE.COMPLETED) llega antes o casi a la vez que esta
  // captura síncrona, solo una de las dos vías aplica el descuento de
  // stock y envía los emails.
  await fulfillPaidOrder(payment.id, {
    status: capture.status,
    captureId,
    rawPayload: capture,
  });

  return { orderId: payment.orderId };
}
