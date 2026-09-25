import { prisma } from "@/lib/prisma";
import { sendLikeReminderEmail } from "@/lib/email";

export type LikeReminderDetail = { email: string; productName: string };

export type LikeReminderResult = {
  sent: number;
  skipped: number;
  details: LikeReminderDetail[];
};

// Lógica compartida entre scripts/send-like-reminders.ts (CLI) y el botón
// "Lanzar" en /admin/recordatorios -- un único sitio que decide a quién le
// toca recordatorio, para que ambas vías de disparo (terminal y panel) se
// comporten exactamente igual.
export async function runLikeReminders({
  dryRun = false,
  minDays = 3,
}: { dryRun?: boolean; minDays?: number } = {}): Promise<LikeReminderResult> {
  const cutoff = new Date(Date.now() - minDays * 24 * 60 * 60 * 1000);

  const candidates = await prisma.productLike.findMany({
    where: {
      reminderSentAt: null,
      createdAt: { lte: cutoff },
      product: { isActive: true, stock: { gt: 0 } },
    },
    include: {
      user: { select: { email: true } },
      product: {
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: true },
      },
    },
  });

  let sent = 0;
  let skipped = 0;
  const details: LikeReminderDetail[] = [];

  for (const like of candidates) {
    // Ya lo compró -- no tiene sentido recordárselo.
    const alreadyOrdered = await prisma.orderItem.findFirst({
      where: { productId: like.productId, order: { userId: like.userId } },
      select: { id: true },
    });
    if (alreadyOrdered) {
      skipped += 1;
      continue;
    }

    if (!dryRun) {
      try {
        await sendLikeReminderEmail(like.user.email, {
          name: like.product.name,
          slug: like.product.slug,
          categorySlug: like.product.category.slug,
          priceCents: like.product.priceCents,
          imageUrl: like.product.images[0]?.url ?? null,
        });
        await prisma.productLike.update({
          where: { id: like.id },
          data: { reminderSentAt: new Date() },
        });
      } catch (error) {
        console.error(`No se pudo enviar el recordatorio a ${like.user.email}:`, error);
        continue;
      }
    }

    sent += 1;
    details.push({ email: like.user.email, productName: like.product.name });
  }

  return { sent, skipped, details };
}
