"use client";

import { useRef, useState } from "react";

/**
 * Autoguarda los campos de un formulario en localStorage mientras se edita,
 * para no perder el progreso si falla el envío (validación, sesión caducada,
 * cierre accidental de la pestaña...). Solo texto/checkboxes -- no vale para
 * campos con archivos.
 */
export function useFormDraft(key: string | null) {
  const [draft] = useState<Record<string, string> | null>(() => {
    if (!key || typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as Record<string, string>) : null;
    } catch {
      return null;
    }
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleSave(formData: FormData) {
    if (!key) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const values: Record<string, string> = {};
      formData.forEach((value, name) => {
        if (typeof value === "string") values[name] = value;
      });
      localStorage.setItem(key, JSON.stringify(values));
    }, 300);
  }

  function clearDraft() {
    if (!key) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    localStorage.removeItem(key);
  }

  return { draft, scheduleSave, clearDraft };
}
