import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB (del archivo original, antes de convertir)
const MAX_DIMENSION = 1600; // de sobra para el grid y el modal de detalle
const WEBP_QUALITY = 82;

// Fuera de "public" a propósito: el servidor standalone de Next.js sirve
// "public" con una lista de archivos calculada al arrancar, así que un
// archivo escrito ahí después de que el proceso arrancó no se sirve hasta
// el siguiente restart (probado en producción: un 404 pasaba a 200 tras un
// "docker compose restart app" sin ningún cambio de código). Por eso las
// imágenes se sirven con una ruta dinámica (src/app/uploads/[filename]) que
// lee el archivo del disco en cada petición.
export const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Solo coincide con el nombre de archivo que generamos nosotros (uuid +
// extensión permitida) -- así una URL externa pegada a mano, o cualquier
// intento de path traversal, nunca puede leer o borrar algo fuera de aquí.
export const OWNED_FILENAME = /^[0-9a-f-]{36}\.(jpe?g|png|webp|avif)$/i;

export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Formato no soportado. Usa JPEG, PNG, WebP o AVIF.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("La imagen pesa más de 5MB.");
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  // Se reencoda todo a WebP (independientemente del formato de origen) y se
  // limita el lado más largo -- reduce mucho el peso en disco sin que se
  // note en la tienda, donde las imágenes nunca se muestran a tamaño completo.
  let outputBuffer: Buffer;
  try {
    outputBuffer = await sharp(inputBuffer)
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    throw new Error("El archivo no es una imagen válida.");
  }

  const filename = `${crypto.randomUUID()}.webp`;

  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(path.join(UPLOADS_DIR, filename), outputBuffer);

  return `/uploads/${filename}`;
}

export async function deleteProductImage(url: string): Promise<void> {
  const filename = path.basename(url);
  if (!OWNED_FILENAME.test(filename)) return;
  await rm(path.join(UPLOADS_DIR, filename), { force: true });
}
