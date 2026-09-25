"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCents } from "@/lib/money";
import { PayPalCheckoutButtons } from "@/components/checkout/paypal-buttons";

type Address = {
  id: string;
  label: string | null;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string;
};

type CartLine = {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
};

export function CheckoutClient({
  addresses,
  items,
  totalCents,
}: {
  addresses: Address[];
  items: CartLine[];
  totalCents: number;
}) {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses[0]?.id ?? null
  );

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        <h2 className="mb-4 text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Dirección de envío
        </h2>
        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tienes ninguna dirección guardada.{" "}
            <Link href="/cuenta/direcciones" className="underline underline-offset-4">
              Añade una
            </Link>{" "}
            antes de continuar.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {addresses.map((address) => (
              <li key={address.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 text-sm has-[:checked]:border-foreground">
                  <input
                    type="radio"
                    name="addressId"
                    value={address.id}
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                    className="mt-1"
                  />
                  <span>
                    {address.label && (
                      <span className="block font-medium">{address.label}</span>
                    )}
                    <span className="block">{address.fullName}</span>
                    <span className="block text-muted-foreground">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""} —{" "}
                      {address.postalCode} {address.city}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border p-6">
        <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Resumen
        </h2>
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatCents(item.priceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-border pt-4 text-base font-semibold">
          <span>Total</span>
          <span>{formatCents(totalCents)}</span>
        </div>

        <div className="pt-2">
          <PayPalCheckoutButtons addressId={selectedAddressId} />
        </div>
      </div>
    </div>
  );
}
