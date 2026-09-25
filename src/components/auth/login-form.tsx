"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { login, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = undefined;

export function LoginForm() {
  const [error, action, pending] = useActionState(login, initialState);

  return (
    <form action={action}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <Link
              href="/olvide-password"
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </FieldGroup>
    </form>
  );
}
