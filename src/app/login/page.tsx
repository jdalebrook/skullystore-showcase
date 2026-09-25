import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleButton } from "@/components/auth/google-button";
import { FieldSeparator } from "@/components/ui/field";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Entrar
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        ¿Todavía no tienes cuenta?{" "}
        <Link href="/registro" className="underline underline-offset-4 hover:text-foreground">
          Crea una
        </Link>
        .
      </p>

      <div className="mt-8 flex flex-col gap-6">
        <LoginForm />
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
