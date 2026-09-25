"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteProduct, type DeleteProductState } from "@/lib/actions/admin/products";

const initialState: DeleteProductState = undefined;

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [state, formAction, pending] = useActionState(
    deleteProduct.bind(null, productId),
    initialState
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`¿Eliminar "${productName}"? Esta acción no se puede deshacer.`)) {
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
