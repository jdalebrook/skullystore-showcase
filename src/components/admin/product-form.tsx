"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { type ProductState } from "@/lib/actions/admin/products";
import { useActionSuccessToast } from "@/hooks/use-action-success-toast";
import { useFormDraft } from "@/hooks/use-form-draft";
import { ImageUploader } from "@/components/admin/image-uploader";
import { slugify } from "@/lib/slug";

type Category = { id: string; name: string };

type ProductDefaults = {
  name: string;
  slug: string;
  shortDesc: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  accentColor: string;
  layoutVariant: string;
  badgeText: string;
  isActive: boolean;
  imageUrls: string;
  weightGrams: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  vat: string;
  shippingCost: string;
};

const initialState: ProductState = undefined;

export function ProductForm({
  categories,
  action,
  defaults,
  submitLabel,
}: {
  categories: Category[];
  action: (state: ProductState, formData: FormData) => Promise<ProductState>;
  defaults?: Partial<ProductDefaults>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const router = useRouter();

  // El borrador solo aplica al crear -- al editar, la BD ya es la copia de
  // seguridad (en el peor caso se vuelve a editar desde los datos actuales).
  const isCreate = !defaults;
  const draftKey = isCreate ? "skullystore:draft:product:new" : null;
  const { draft, scheduleSave, clearDraft } = useFormDraft(draftKey);
  const formRef = useRef<HTMLFormElement>(null);

  // Al crear, se navega al listado tras guardar (si no, la pantalla se queda
  // en "Nuevo producto" con los mismos datos ya enviados, dando la impresión
  // de que no ha pasado nada). Al editar no hace falta: seguir en la misma
  // página tras guardar cambios es lo esperado.
  useActionSuccessToast(pending, !!state?.errors, "Producto guardado.", () => {
    clearDraft();
    if (isCreate) router.push("/admin/productos");
  });

  useEffect(() => {
    if (draft) toast.info("Se ha recuperado el progreso de tu último intento sin guardar.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function get(field: keyof Omit<ProductDefaults, "isActive">) {
    return draft?.[field] ?? defaults?.[field];
  }

  function discardDraft() {
    if (!window.confirm("¿Descartar el progreso guardado y empezar de cero?")) return;
    clearDraft();
    window.location.reload();
  }

  function handleSlugBlur(event: React.FocusEvent<HTMLInputElement>) {
    const normalized = slugify(event.target.value);
    if (normalized && normalized !== event.target.value) {
      event.target.value = normalized;
      toast.info(`Slug ajustado a "${normalized}".`);
    }
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onChange={(event) => {
        if (draftKey) scheduleSave(new FormData(event.currentTarget));
      }}
    >
      <FieldGroup>
        {draft && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm">
            <span>Se ha recuperado el progreso de tu último intento.</span>
            <Button type="button" variant="ghost" size="sm" onClick={discardDraft}>
              Descartar y empezar de cero
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!state?.errors?.name}>
            <FieldLabel htmlFor="name" required>
              Nombre
            </FieldLabel>
            <Input id="name" name="name" defaultValue={get("name")} required />
            <FieldError errors={state?.errors?.name?.map((message) => ({ message }))} />
          </Field>

          <Field data-invalid={!!state?.errors?.slug}>
            <FieldLabel htmlFor="slug" required>
              Slug
            </FieldLabel>
            <Input
              id="slug"
              name="slug"
              defaultValue={get("slug")}
              onBlur={handleSlugBlur}
              required
            />
            <FieldError errors={state?.errors?.slug?.map((message) => ({ message }))} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="shortDesc">Descripción corta</FieldLabel>
          <Input id="shortDesc" name="shortDesc" defaultValue={get("shortDesc")} />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Descripción completa</FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={get("description")}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field data-invalid={!!state?.errors?.price}>
            <FieldLabel htmlFor="price" required>
              Precio (€)
            </FieldLabel>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={get("price")}
              required
            />
            <FieldError errors={state?.errors?.price?.map((message) => ({ message }))} />
          </Field>

          <Field>
            <FieldLabel htmlFor="vat">IVA incluido (€)</FieldLabel>
            <Input
              id="vat"
              name="vat"
              type="number"
              step="0.01"
              min="0"
              defaultValue={get("vat")}
            />
            <FieldError errors={state?.errors?.vat?.map((message) => ({ message }))} />
          </Field>

          <Field>
            <FieldLabel htmlFor="shippingCost">Envío incluido (€)</FieldLabel>
            <Input
              id="shippingCost"
              name="shippingCost"
              type="number"
              step="0.01"
              min="0"
              defaultValue={get("shippingCost")}
            />
            <FieldError
              errors={state?.errors?.shippingCost?.map((message) => ({ message }))}
            />
          </Field>
        </div>

        <p className="-mt-2 text-sm text-muted-foreground">
          El Precio de arriba es el importe final que paga el cliente. IVA y
          Envío aquí son solo un desglose informativo de cuánto de ese precio
          corresponde a cada cosa -- no se suma nada más en el checkout.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field data-invalid={!!state?.errors?.stock}>
            <FieldLabel htmlFor="stock" required>
              Stock
            </FieldLabel>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              defaultValue={get("stock") ?? "0"}
              required
            />
            <FieldError errors={state?.errors?.stock?.map((message) => ({ message }))} />
          </Field>

          <Field data-invalid={!!state?.errors?.categoryId}>
            <FieldLabel htmlFor="categoryId" required>
              Categoría
            </FieldLabel>
            <Select name="categoryId" defaultValue={get("categoryId")}>
              <SelectTrigger id="categoryId" className="w-full">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError
              errors={state?.errors?.categoryId?.map((message) => ({ message }))}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="accentColor">Color de acento (hex)</FieldLabel>
            <Input
              id="accentColor"
              name="accentColor"
              placeholder="#7c3aed"
              defaultValue={get("accentColor")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="layoutVariant">Proporción de imagen</FieldLabel>
            <Select name="layoutVariant" defaultValue={get("layoutVariant") ?? "default"}>
              <SelectTrigger id="layoutVariant" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Estándar (4:5)</SelectItem>
                <SelectItem value="poster">Póster (3:4)</SelectItem>
                <SelectItem value="compact">Compacta (1:1)</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="badgeText">Etiqueta (opcional)</FieldLabel>
            <Input
              id="badgeText"
              name="badgeText"
              placeholder="Nuevo, Más vendido..."
              defaultValue={get("badgeText")}
            />
          </Field>
        </div>

        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            Peso y dimensiones (opcional) — de cara a calcular gastos de envío
            más adelante, todavía no se usan en ningún cálculo.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field>
              <FieldLabel htmlFor="weightGrams">Peso (g)</FieldLabel>
              <Input
                id="weightGrams"
                name="weightGrams"
                type="number"
                min="0"
                step="1"
                defaultValue={get("weightGrams")}
              />
              <FieldError
                errors={state?.errors?.weightGrams?.map((message) => ({ message }))}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="lengthCm">Largo (cm)</FieldLabel>
              <Input
                id="lengthCm"
                name="lengthCm"
                type="number"
                min="0"
                step="1"
                defaultValue={get("lengthCm")}
              />
              <FieldError errors={state?.errors?.lengthCm?.map((message) => ({ message }))} />
            </Field>

            <Field>
              <FieldLabel htmlFor="widthCm">Ancho (cm)</FieldLabel>
              <Input
                id="widthCm"
                name="widthCm"
                type="number"
                min="0"
                step="1"
                defaultValue={get("widthCm")}
              />
              <FieldError errors={state?.errors?.widthCm?.map((message) => ({ message }))} />
            </Field>

            <Field>
              <FieldLabel htmlFor="heightCm">Alto (cm)</FieldLabel>
              <Input
                id="heightCm"
                name="heightCm"
                type="number"
                min="0"
                step="1"
                defaultValue={get("heightCm")}
              />
              <FieldError errors={state?.errors?.heightCm?.map((message) => ({ message }))} />
            </Field>
          </div>
        </div>

        <Field orientation="horizontal">
          <Switch
            id="isActive"
            name="isActive"
            defaultChecked={draft ? draft.isActive === "on" : (defaults?.isActive ?? true)}
          />
          <FieldLabel htmlFor="isActive">Visible en la tienda</FieldLabel>
        </Field>

        <Field>
          <FieldLabel>Imágenes</FieldLabel>
          <ImageUploader
            name="imageUrls"
            defaultValue={get("imageUrls")}
            onUrlsChange={() => {
              if (draftKey && formRef.current) scheduleSave(new FormData(formRef.current));
            }}
          />
        </Field>

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Guardando..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
