import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Recuperar contraseña
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Te enviaremos un enlace para elegir una contraseña nueva.
      </p>

      <div className="mt-8">
        <ForgotPasswordForm />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
          Volver a entrar
        </Link>
      </p>
    </div>
  );
}
