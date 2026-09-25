"use client";

import { useEffect, useId, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { Field, FieldLabel } from "@/components/ui/field";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export type ParsedAddress = {
  line1: string;
  city: string;
  province: string;
  postalCode: string;
};

// setOptions() solo se puede llamar una vez y antes de la primera carga --
// y una sola promesa de importLibrary() para toda la app, para no volver a
// inyectar el script de Google Maps si este componente se monta más de una vez.
let optionsSet = false;
let placesLibraryPromise: ReturnType<typeof importLibrary<"places">> | null = null;

function loadPlacesLibrary() {
  if (!apiKey) return null;
  if (!optionsSet) {
    setOptions({ key: apiKey });
    optionsSet = true;
  }
  if (!placesLibraryPromise) {
    placesLibraryPromise = importLibrary("places");
  }
  return placesLibraryPromise;
}

function getAddressComponent(
  components: google.maps.places.AddressComponent[],
  type: string
): string {
  return components.find((component) => component.types.includes(type))?.longText ?? "";
}

// Solo autocompleta -- los campos reales que se envían en el formulario
// siguen siendo los <Input> normales de AddressForm (sin estilos raros del
// componente de Google), rellenados por referencia al seleccionar un sitio.
export function GoogleAddressAutocomplete({
  onSelect,
}: {
  onSelect: (address: ParsedAddress) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldId = useId();

  useEffect(() => {
    if (!apiKey || !containerRef.current) return;

    let cancelled = false;
    let element: google.maps.places.PlaceAutocompleteElement | undefined;

    loadPlacesLibrary()?.then(() => {
      if (cancelled || !containerRef.current) return;

      element = new google.maps.places.PlaceAutocompleteElement({
        includedRegionCodes: ["es"],
      });
      containerRef.current.appendChild(element);

      element.addEventListener("gmp-select", async (event) => {
        const { placePrediction } = event as unknown as {
          placePrediction: google.maps.places.PlacePrediction;
        };
        const place = placePrediction.toPlace();
        await place.fetchFields({ fields: ["addressComponents"] });

        const components = place.addressComponents ?? [];
        const streetNumber = getAddressComponent(components, "street_number");
        const route = getAddressComponent(components, "route");

        onSelect({
          line1: [route, streetNumber].filter(Boolean).join(", "),
          city:
            getAddressComponent(components, "locality") ||
            getAddressComponent(components, "postal_town"),
          province: getAddressComponent(components, "administrative_area_level_1"),
          postalCode: getAddressComponent(components, "postal_code"),
        });
      });
    });

    return () => {
      cancelled = true;
      element?.remove();
    };
  }, [onSelect]);

  if (!apiKey) return null;

  return (
    <Field>
      <FieldLabel htmlFor={fieldId}>Buscar dirección (opcional)</FieldLabel>
      <div ref={containerRef} id={fieldId} />
    </Field>
  );
}
