"use client";

import { useEffect, useRef, useState } from "react";
import { XIcon } from "@/components/icons/x-icon";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ImageUploader({
  name,
  defaultValue,
  onUrlsChange,
}: {
  name: string;
  defaultValue?: string;
  onUrlsChange?: (urls: string[]) => void;
}) {
  const initialUrls = useRef(
    new Set(defaultValue ? defaultValue.split("\n").filter(Boolean) : [])
  );
  const [urls, setUrls] = useState<string[]>(() =>
    defaultValue ? defaultValue.split("\n").filter(Boolean) : []
  );
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // El cambio de urls no dispara un evento nativo "change" en el <input
  // type="hidden"> (React solo actualiza su atributo value), así que un
  // listener onChange en el <form> no se entera -- de ahí este callback
  // explícito para el autoguardado de borrador en ProductForm.
  useEffect(() => {
    onUrlsChange?.(urls);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo subir la imagen.");
      }
      setUrls((prev) => [...prev, data.url as string]);
      toast.success("Imagen subida.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    const url = urls[index];
    const isOwnFile = url.startsWith("/uploads/");
    const isPreExisting = initialUrls.current.has(url);

    if (isOwnFile) {
      const message = isPreExisting
        ? "La imagen se borrará del servidor de forma permanente al guardar el producto. ¿Continuar?"
        : "Esto borra el archivo del servidor de forma permanente. ¿Continuar?";
      if (!window.confirm(message)) return;
    }

    setUrls((prev) => prev.filter((_, i) => i !== index));

    if (!isOwnFile) return;

    if (isPreExisting) {
      // Ya estaba guardada en este producto -- no se borra del disco hasta
      // que el formulario se guarde con éxito (lo hace el Server Action),
      // para no dejar una referencia rota si se cancela la edición.
      setPendingDeletions((prev) => [...prev, url]);
      return;
    }

    // Subida en esta misma sesión, todavía no referenciada en ningún
    // producto guardado: se puede borrar del disco ya mismo.
    fetch("/api/admin/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((response) => {
        if (!response.ok) throw new Error();
      })
      .catch(() => toast.error("No se pudo borrar el archivo del servidor."));
  }

  function makeMain(index: number) {
    setUrls((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  }

  function addManualUrl() {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    setUrls((prev) => [...prev, trimmed]);
    setManualUrl("");
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={urls.join("\n")} />
      <input type="hidden" name={`${name}_deleted`} value={pendingDeletions.join("\n")} />

      {urls.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {urls.map((url, index) => (
            <li
              key={`${url}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- previsualización de admin, la URL puede ser de cualquier dominio si se pegó a mano */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              {index === 0 ? (
                <span className="absolute top-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Principal
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeMain(index)}
                  className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Hacer principal
                </button>
              )}
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Quitar imagen"
              >
                <XIcon className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "Subiendo..." : "Subir imagen"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex items-center gap-2">
          <Input
            value={manualUrl}
            onChange={(event) => setManualUrl(event.target.value)}
            placeholder="o pega una URL"
            className="h-8 w-48"
          />
          <Button type="button" variant="ghost" size="sm" onClick={addManualUrl}>
            Añadir
          </Button>
        </div>
      </div>
    </div>
  );
}
