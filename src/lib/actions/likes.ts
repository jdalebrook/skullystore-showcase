"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function toggleLike(productId: string): Promise<{ liked: boolean; count: number }> {
  const user = await requireUser();

  const existing = await prisma.productLike.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await prisma.productLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.productLike.create({ data: { userId: user.id, productId } });
  }

  const count = await prisma.productLike.count({ where: { productId } });

  revalidatePath("/");
  revalidatePath("/categoria/[slug]", "page");

  return { liked: !existing, count };
}
