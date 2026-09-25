import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Elige una contraseña nueva
      </h1>

      {token ? (
        <div className="mt-8">
          <ResetPasswordForm token={token} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Este enlace no es válido.{" "}
          <Link href="/olvide-password" className="underline underline-offset-4 hover:text-foreground">
            Pide uno nuevo
          </Link>
          .
        </p>
      )}
    </div>
  );
}
