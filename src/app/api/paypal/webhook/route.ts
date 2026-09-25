import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayPalWebhookSignature } from "@/lib/paypal";
import { fulfillPaidOrder } from "@/lib/order-fulfillment";

// Red de seguridad para la captura síncrona de PayPal (src/lib/actions/checkout.ts
// captureOrder()): si la respuesta de esa captura nunca llega al servidor
// (corte de red, pestaña cerrada justo después de pagar...) pero PayPal sí
// completó el cobro de verdad, este webhook es la única forma de que el
// pedido llegue a marcarse como pagado. fulfillPaidOrder() es idempotente,
// así que no importa si esta vía y la síncrona coinciden en el mismo pedido.
//
// Requiere configurar el webhook en el PayPal Developer Dashboard (App →
// Add Webhook) apuntando a esta URL, con al menos el evento
// "Payment capture completed", y poner el Webhook ID resultante en
// PAYPAL_WEBHOOK_ID.
export async function POST(request: Request) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    return NextResponse.json({ error: "Webhook no configurado." }, { status: 503 });
  }

  const rawBody = await request.text();

  let event: { event_type?: string; resource?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const verified = await verifyPayPalWebhookSignature(
    {
      transmissionId: request.headers.get("paypal-transmission-id") ?? "",
      transmissionTime: request.headers.get("paypal-transmission-time") ?? "",
      certUrl: request.headers.get("paypal-cert-url") ?? "",
      authAlgo: request.headers.get("paypal-auth-algo") ?? "",
      transmissionSig: request.headers.get("paypal-transmission-sig") ?? "",
    },
    webhookId,
    event
  );

  if (!verified) {
    console.error("Webhook de PayPal con firma inválida, ignorado.");
    return NextResponse.json({ error: "Firma inválida." }, { status: 400 });
  }

  // Otros eventos (denegado, reembolso, disputa...) no se procesan
  // todavía -- se reconoce con 200 para que PayPal no reintente sin
  // sentido, pero no se hace nada con ellos.
  if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
    return NextResponse.json({ received: true });
  }

  const resource = event.resource ?? {};
  const supplementaryData = resource.supplementary_data as
    | { related_ids?: { order_id?: string } }
    | undefined;
  const paypalOrderId = supplementaryData?.related_ids?.order_id;
  const captureId = resource.id as string | undefined;
  const status = (resource.status as string | undefined) ?? "COMPLETED";

  if (!paypalOrderId) {
    return NextResponse.json({ received: true });
  }

  const payment = await prisma.payment.findUnique({ where: { paypalOrderId } });
  if (!payment) {
    // Pedido de otro entorno (sandbox/live cruzados) o que ya no existe --
    // se reconoce igual, no hay nada que hacer aquí.
    return NextResponse.json({ received: true });
  }

  await fulfillPaidOrder(payment.id, { status, captureId, rawPayload: resource });

  return NextResponse.json({ received: true });
}
