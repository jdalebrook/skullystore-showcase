import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { GoogleButton } from "@/components/auth/google-button";
import { FieldSeparator } from "@/components/ui/field";

export default function SignupPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Crear cuenta
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
          Entra aquí
        </Link>
        .
      </p>

      <div className="mt-8 flex flex-col gap-6">
        <SignupForm />
        {!!process.env.AUTH_GOOGLE_ID && (
          <>
            <FieldSeparator>o</FieldSeparator>
            <GoogleButton />
          </>
        )}
      </div>
    </div>
  );
}
