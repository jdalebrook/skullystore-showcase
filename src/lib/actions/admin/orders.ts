"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const VALID_STATUSES = [
  "PENDING",
  "PAID",
  "FULFILLED",
  "CANCELLED",
  "REFUNDED",
] as const;
type OrderStatusValue = (typeof VALID_STATUSES)[number];

export async function updateOrderStatus(orderId: string, formData: FormData) {
  await requireAdmin();

  const status = formData.get("status");
  if (
    typeof status !== "string" ||
    !VALID_STATUSES.includes(status as OrderStatusValue)
  ) {
    throw new Error("Estado de pedido no válido.");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatusValue },
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
}
