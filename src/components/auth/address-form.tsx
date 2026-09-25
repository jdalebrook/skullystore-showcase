"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { addAddress, type AddressState } from "@/lib/actions/addresses";
import { useActionSuccessToast } from "@/hooks/use-action-success-toast";
import { GoogleAddressAutocomplete } from "@/components/auth/google-address-autocomplete";

const initialState: AddressState = undefined;

export function AddressForm() {
  const [state, action, pending] = useActionState(addAddress, initialState);
  useActionSuccessToast(pending, !!state?.errors, "Dirección añadida.", () => {
    // La dirección nueva aparece arriba del todo en la lista (orden por
    // createdAt desc) -- si el formulario queda lejos por tener varias
    // direcciones ya guardadas, sin esto no se vería sin desplazarse a mano.
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const line1Ref = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const provinceRef = useRef<HTMLInputElement>(null);
  const postalCodeRef = useRef<HTMLInputElement>(null);

  return (
    <form action={action}>
      <FieldGroup>
        <Field data-invalid={!!state?.errors?.label}>
          <FieldLabel htmlFor="label">Etiqueta (opcional)</FieldLabel>
          <Input id="label" name="label" placeholder="Casa, trabajo..." />
        </Field>

        <Field data-invalid={!!state?.errors?.fullName}>
          <FieldLabel htmlFor="fullName" required>
            Nombre completo
          </FieldLabel>
          <Input id="fullName" name="fullName" required />
          <FieldError errors={state?.errors?.fullName?.map((message) => ({ message }))} />
        </Field>

        <GoogleAddressAutocomplete
          onSelect={(address) => {
            if (line1Ref.current) line1Ref.current.value = address.line1;
            if (cityRef.current) cityRef.current.value = address.city;
            if (provinceRef.current) provinceRef.current.value = address.province;
            if (postalCodeRef.current) postalCodeRef.current.value = address.postalCode;
          }}
        />

        <Field data-invalid={!!state?.errors?.line1}>
          <FieldLabel htmlFor="line1" required>
            Dirección
          </FieldLabel>
          <Input id="line1" name="line1" ref={line1Ref} required />
          <FieldError errors={state?.errors?.line1?.map((message) => ({ message }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="line2">Piso, puerta... (opcional)</FieldLabel>
          <Input id="line2" name="line2" />
        </Field>

        <Field data-invalid={!!state?.errors?.city}>
          <FieldLabel htmlFor="city" required>
            Ciudad
          </FieldLabel>
          <Input id="city" name="city" ref={cityRef} required />
          <FieldError errors={state?.errors?.city?.map((message) => ({ message }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="province">Provincia (opcional)</FieldLabel>
          <Input id="province" name="province" ref={provinceRef} />
        </Field>

        <Field data-invalid={!!state?.errors?.postalCode}>
          <FieldLabel htmlFor="postalCode" required>
            Código postal
          </FieldLabel>
          <Input id="postalCode" name="postalCode" ref={postalCodeRef} required />
          <FieldError errors={state?.errors?.postalCode?.map((message) => ({ message }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="phone">Teléfono (opcional)</FieldLabel>
          <Input id="phone" name="phone" type="tel" />
        </Field>

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Guardando..." : "Añadir dirección"}
        </Button>
      </FieldGroup>
    </form>
  );
}
