"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendStockNotificationRequestEmail } from "@/lib/email";

const EmailSchema = z.email({ error: "Introduce un email válido." }).trim().toLowerCase();

export type StockNotificationState = { message: string } | undefined;

const GENERIC_MESSAGE = "¡Gracias! Te avisaremos por email en cuanto vuelva a haber stock.";

export async function requestStockNotification(
  _prevState: StockNotificationState,
  formData: FormData
): Promise<StockNotificationState> {
  const productId = formData.get("productId");
  if (typeof productId !== "string" || !productId) {
    return { message: "Producto no válido." };
  }

  const validatedEmail = EmailSchema.safeParse(formData.get("email"));
  if (!validatedEmail.success) {
    return { message: validatedEmail.error.issues[0]?.message ?? "Email no válido." };
  }
  const email = validatedEmail.data;

  const { allowed } = rateLimit(`stock-notify:${email}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return { message: GENERIC_MESSAGE };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true },
  });
  if (!product) {
    return { message: "Producto no válido." };
  }

  // @@unique([productId, email]) evita duplicados -- si ya lo había pedido,
  // se responde igual sin volver a avisar al admin.
  const existing = await prisma.stockNotificationRequest.findUnique({
    where: { productId_email: { productId: product.id, email } },
  });

  if (!existing) {
    await prisma.stockNotificationRequest.create({
      data: { productId: product.id, email },
    });

    try {
      await sendStockNotificationRequestEmail(product, email);
    } catch (error) {
      console.error("No se pudo enviar el aviso de petición de stock al admin:", error);
    }
  }

  return { message: GENERIC_MESSAGE };
}
