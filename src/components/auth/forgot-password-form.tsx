"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { requestPasswordReset, type RequestResetState } from "@/lib/actions/password-reset";

const initialState: RequestResetState = undefined;

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState);

  return (
    <form action={action}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>

        {state?.message && <p className="text-sm text-muted-foreground">{state.message}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Enviando..." : "Enviar enlace de recuperación"}
        </Button>
      </FieldGroup>
    </form>
  );
}
