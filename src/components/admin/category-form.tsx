"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { type CategoryState } from "@/lib/actions/admin/categories";
import { useActionSuccessToast } from "@/hooks/use-action-success-toast";
import { slugify } from "@/lib/slug";

type CategoryDefaults = {
  name: string;
  slug: string;
  description: string;
};

const initialState: CategoryState = undefined;

export function CategoryForm({
  action,
  defaults,
  submitLabel,
  pendingLabel,
  successMessage,
}: {
  action: (state: CategoryState, formData: FormData) => Promise<CategoryState>;
  defaults?: Partial<CategoryDefaults>;
  submitLabel: string;
  pendingLabel: string;
  successMessage: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  useActionSuccessToast(pending, !!state?.errors, successMessage);

  function handleSlugBlur(event: React.FocusEvent<HTMLInputElement>) {
    const normalized = slugify(event.target.value);
    if (normalized && normalized !== event.target.value) {
      event.target.value = normalized;
      toast.info(`Slug ajustado a "${normalized}".`);
    }
  }

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field data-invalid={!!state?.errors?.name}>
          <FieldLabel htmlFor="name" required>
            Nombre
          </FieldLabel>
          <Input id="name" name="name" defaultValue={defaults?.name} required />
          <FieldError errors={state?.errors?.name?.map((message) => ({ message }))} />
        </Field>

        <Field data-invalid={!!state?.errors?.slug}>
          <FieldLabel htmlFor="slug" required>
            Slug (para la URL)
          </FieldLabel>
          <Input
            id="slug"
            name="slug"
            placeholder="accesorios-metal"
            defaultValue={defaults?.slug}
            onBlur={handleSlugBlur}
            required
          />
          <FieldError errors={state?.errors?.slug?.map((message) => ({ message }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Descripción (opcional)</FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={defaults?.description}
          />
        </Field>

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? pendingLabel : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
