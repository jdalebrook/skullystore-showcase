"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteCategory, type DeleteCategoryState } from "@/lib/actions/admin/categories";

const initialState: DeleteCategoryState = undefined;

export function DeleteCategoryButton({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) {
  const [state, formAction, pending] = useActionState(
    deleteCategory.bind(null, categoryId),
    initialState
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`¿Eliminar "${categoryName}"? Esta acción no se puede deshacer.`)) {
          event.preventDefault();
        }
      }}
    >
      <Button variant="ghost" size="sm" type="submit" disabled={pending}>
        {pending ? "Eliminando..." : "Eliminar"}
      </Button>
    </form>
  );
}
