"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  sendLikeRemindersAction,
  type LikeReminderState,
} from "@/lib/actions/admin/like-reminders";

const initialState: LikeReminderState = undefined;

export function LikeRemindersForm() {
  const [state, action, pending] = useActionState(sendLikeRemindersAction, initialState);

  return (
    <div className="flex flex-col gap-6">
      <form action={action}>
        <FieldGroup>
          <Field orientation="horizontal">
            <Switch id="dryRun" name="dryRun" defaultChecked />
            <FieldLabel htmlFor="dryRun">
              Solo previsualizar (no envía nada todavía)
            </FieldLabel>
          </Field>

          <Field>
            <FieldLabel htmlFor="minDays">Antigüedad mínima del like (días)</FieldLabel>
            <Input
              id="minDays"
              name="minDays"
              type="number"
              min="0"
              step="1"
              defaultValue="3"
              className="w-32"
            />
          </Field>

          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? "Procesando..." : "Lanzar"}
          </Button>
        </FieldGroup>
      </form>

      {state && (
        <div className="rounded-lg border border-border p-4 text-sm">
          <p className="font-medium">
            {state.dryRun
              ? `${state.result.sent} recordatorio(s) se enviarían`
              : `${state.result.sent} recordatorio(s) enviados`}
            , {state.result.skipped} omitido(s) (ya comprado).
          </p>
          {state.result.details.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1 text-muted-foreground">
              {state.result.details.map((detail, index) => (
                <li key={index}>
                  {detail.email} — {detail.productName}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
