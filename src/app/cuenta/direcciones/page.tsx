import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteAddress } from "@/lib/actions/addresses";
import { Button } from "@/components/ui/button";
import { AddressForm } from "@/components/auth/address-form";

export default async function AddressesPage() {
  const user = await requireUser();

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      {addresses.length > 0 && (
        <ul className="flex flex-col gap-3">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-border p-4 text-sm"
            >
              <div>
                {address.label && (
                  <p className="font-medium">{address.label}</p>
                )}
                <p>{address.fullName}</p>
                <p>
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                </p>
                <p>
                  {address.postalCode} {address.city}
                  {address.province ? `, ${address.province}` : ""}
                </p>
              </div>
              <form action={deleteAddress.bind(null, address.id)}>
                <Button variant="ghost" size="sm" type="submit">
                  Eliminar
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <div>
        <h2 className="mb-4 text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Añadir dirección
        </h2>
        <AddressForm />
      </div>
    </div>
  );
}
