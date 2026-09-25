"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { signup, type SignupState } from "@/lib/actions/auth";

const initialState: SignupState = undefined;

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, initialState);

  return (
    <form action={action}>
      <FieldGroup>
        <Field data-invalid={!!state?.errors?.name}>
          <FieldLabel htmlFor="name">Nombre</FieldLabel>
          <Input id="name" name="name" autoComplete="name" required />
          <FieldError errors={state?.errors?.name?.map((message) => ({ message }))} />
        </Field>

        <Field data-invalid={!!state?.errors?.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" required />
          <FieldError errors={state?.errors?.email?.map((message) => ({ message }))} />
        </Field>

        <Field data-invalid={!!state?.errors?.password}>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
          <FieldError errors={state?.errors?.password?.map((message) => ({ message }))} />
        </Field>

        {state?.message && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </FieldGroup>
    </form>
  );
}
