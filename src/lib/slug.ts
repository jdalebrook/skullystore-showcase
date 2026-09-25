// Convierte cualquier texto en un slug valido (minusculas, sin acentos,
// solo letras/numeros separados por guiones) -- para forzar el formato que
// pide el propio validador (ProductSchema/CategorySchema en /^[a-z0-9-]+$/).
export function slugify(input: string): string {
  // Marcas diacriticas combinantes (U+0300-U+036F), las que quedan sueltas
  // tras normalizar a NFD (ej. "n" con tilde -> "n" + marca combinante).
  const COMBINING_DIACRITICS_START = 0x0300;
  const COMBINING_DIACRITICS_END = 0x036f;

  const withoutDiacritics = Array.from(input.normalize("NFD"))
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0;
      return code < COMBINING_DIACRITICS_START || code > COMBINING_DIACRITICS_END;
    })
    .join("");

  return withoutDiacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
