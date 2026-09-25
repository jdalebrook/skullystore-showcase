import { requireUser } from "@/lib/session";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export default async function AccountProfilePage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Nombre</p>
        <p className="font-medium">{user.name ?? "—"}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Email</p>
        <p className="font-medium">{user.email}</p>
      </div>

      <form action={logout} className="pt-4">
        <Button variant="outline" type="submit">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}
