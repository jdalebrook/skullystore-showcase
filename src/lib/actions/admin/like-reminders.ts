"use server";

import { requireAdmin } from "@/lib/session";
import { runLikeReminders, type LikeReminderResult } from "@/lib/like-reminders";

export type LikeReminderState = { result: LikeReminderResult; dryRun: boolean } | undefined;

export async function sendLikeRemindersAction(
  _prevState: LikeReminderState,
  formData: FormData
): Promise<LikeReminderState> {
  await requireAdmin();

  const dryRun = formData.get("dryRun") === "on";
  const minDaysRaw = Number(formData.get("minDays"));
  const minDays = Number.isFinite(minDaysRaw) && minDaysRaw >= 0 ? minDaysRaw : 3;

  const result = await runLikeReminders({ dryRun, minDays });

  return { result, dryRun };
}
