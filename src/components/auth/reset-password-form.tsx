"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { resetPassword, type ResetPasswordState } from "@/lib/actions/password-reset";

const initialState: ResetPasswordState = undefined;

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, initialState);

  return (
    <form action={action}>
      <input type="hidden" name="token" value={token} />
      <FieldGroup>
        <Field data-invalid={!!state?.error}>
          <FieldLabel htmlFor="password">Contraseña nueva</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </Field>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Guardando..." : "Guardar contraseña"}
        </Button>
      </FieldGroup>
    </form>
  );
}
