"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Muestra un toast de éxito cuando una Server Action ligada a useActionState
 * termina (pending -> idle) sin errores. No hay una señal explícita de
 * "éxito" en useActionState, así que se infiere de esa transición.
 */
export function useActionSuccessToast(
  pending: boolean,
  hasError: boolean,
  message: string,
  onSuccess?: () => void
) {
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !hasError) {
      toast.success(message);
      onSuccess?.();
    }
    wasPending.current = pending;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, hasError, message]);
}
