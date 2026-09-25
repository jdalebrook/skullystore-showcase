"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { deleteProductImage } from "@/lib/storage";

const optionalPositiveInt = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || (Number.isInteger(Number(value)) && Number(value) >= 0), {
    error: "Indica un número entero válido.",
  });

const optionalAmount = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
    error: "Indica un importe válido.",
  });

const ProductSchema = z.object({
  name: z.string().trim().min(2, { error: "El nombre debe tener al menos 2 caracteres." }),
  slug: z
    .string()
    .trim()
    .min(2, { error: "El slug debe tener al menos 2 caracteres." })
    .regex(/^[a-z0-9-]+$/, {
      error: "Solo minúsculas, números y guiones (ej. camiseta-calavera).",
    }),
  shortDesc: z.string().trim().optional(),
  description: z.string().trim().optional(),
  price: z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      error: "Indica un precio válido.",
    }),
  stock: z
    .string()
    .trim()
    .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 0, {
      error: "Indica un stock válido.",
    }),
  categoryId: z.string().trim().min(1, { error: "Selecciona una categoría." }),
  accentColor: z.string().trim().optional(),
  layoutVariant: z.enum(["default", "poster", "compact"]),
  badgeText: z.string().trim().optional(),
  isActive: z.string().optional(),
  imageUrls: z.string().trim().optional(),
  weightGrams: optionalPositiveInt,
  lengthCm: optionalPositiveInt,
  widthCm: optionalPositiveInt,
  heightCm: optionalPositiveInt,
  vat: optionalAmount,
  shippingCost: optionalAmount,
});

export type ProductState =
  | {
      errors?: Record<string, string[]>;
    }
  | undefined;

function parseImageUrls(raw: string | undefined) {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((url, index) => ({ url, isPrimary: index === 0, sortOrder: index }));
}

function parseUrlList(raw: string | undefined) {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

async function deleteImageFiles(urls: string[]) {
  await Promise.allSettled(urls.map((url) => deleteProductImage(url)));
}

function buildData(fields: z.infer<typeof ProductSchema>) {
  return {
    name: fields.name,
    slug: fields.slug,
    shortDesc: fields.shortDesc || null,
    description: fields.description || null,
    priceCents: Math.round(Number(fields.price) * 100),
    stock: Number(fields.stock),
    categoryId: fields.categoryId,
    accentColor: fields.accentColor || null,
    layoutVariant: fields.layoutVariant,
    badgeText: fields.badgeText || null,
    isActive: fields.isActive === "on",
    weightGrams: fields.weightGrams ? Number(fields.weightGrams) : null,
    lengthCm: fields.lengthCm ? Number(fields.lengthCm) : null,
    widthCm: fields.widthCm ? Number(fields.widthCm) : null,
    heightCm: fields.heightCm ? Number(fields.heightCm) : null,
    vatCents: fields.vat ? Math.round(Number(fields.vat) * 100) : null,
    shippingCostCents: fields.shippingCost ? Math.round(Number(fields.shippingCost) * 100) : null,
  };
}

function parseFormData(formData: FormData) {
  return ProductSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    shortDesc: formData.get("shortDesc") || undefined,
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    accentColor: formData.get("accentColor") || undefined,
    layoutVariant: formData.get("layoutVariant") || "default",
    badgeText: formData.get("badgeText") || undefined,
    isActive: formData.get("isActive") || undefined,
    imageUrls: formData.get("imageUrls") || undefined,
    weightGrams: formData.get("weightGrams") || undefined,
    lengthCm: formData.get("lengthCm") || undefined,
    widthCm: formData.get("widthCm") || undefined,
    heightCm: formData.get("heightCm") || undefined,
    vat: formData.get("vat") || undefined,
    shippingCost: formData.get("shippingCost") || undefined,
  });
}

export async function createProduct(
  _prevState: ProductState,
  formData: FormData
): Promise<ProductState> {
  await requireAdmin();

  const validatedFields = parseFormData(formData);
  if (!validatedFields.success) {
    return { errors: z.flattenError(validatedFields.error).fieldErrors };
  }

  const images = parseImageUrls(formData.get("imageUrls")?.toString());

  await prisma.product.create({
    data: {
      ...buildData(validatedFields.data),
      images: { create: images },
    },
  });

  revalidatePath("/admin/productos");
}

export async function updateProduct(
  productId: string,
  _prevState: ProductState,
  formData: FormData
): Promise<ProductState> {
  await requireAdmin();

  const validatedFields = parseFormData(formData);
  if (!validatedFields.success) {
    return { errors: z.flattenError(validatedFields.error).fieldErrors };
  }

  const images = parseImageUrls(formData.get("imageUrls")?.toString());
  const deletedUrls = parseUrlList(formData.get("imageUrls_deleted")?.toString());

  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId } }),
    prisma.product.update({
      where: { id: productId },
      data: {
        ...buildData(validatedFields.data),
        images: { create: images },
      },
    }),
  ]);

  // Solo se borran del disco una vez que el producto se ha guardado con
  // éxito -- si la validación o la transacción fallan, los archivos se
  // quedan intactos (el admin no ha perdido nada al no poder guardar).
  await deleteImageFiles(deletedUrls);

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}`);
}

export type DeleteProductState = { error?: string } | undefined;

export async function deleteProduct(
  productId: string,
  _prevState: DeleteProductState,
  _formData: FormData
): Promise<DeleteProductState> {
  await requireAdmin();

  // A diferencia de CartItem (que sí cascada al borrar el producto), un
  // pedido ya hecho tiene que conservar su historial aunque el producto
  // deje de venderse -- por eso no se permite el borrado si hay pedidos.
  // Se devuelve el error en vez de lanzarlo: Next.js oculta el mensaje de
  // los errores lanzados desde una Server Action en producción, así que un
  // throw aquí llegaría al admin como un fallo genérico sin explicación.
  const orderItemCount = await prisma.orderItem.count({ where: { productId } });
  if (orderItemCount > 0) {
    return {
      error:
        'No se puede eliminar un producto con pedidos asociados. Desactívalo ("Visible" en Editar) en su lugar.',
    };
  }

  const images = await prisma.productImage.findMany({
    where: { productId },
    select: { url: true },
  });

  await prisma.product.delete({ where: { id: productId } });

  await deleteImageFiles(images.map((image) => image.url));

  revalidatePath("/admin/productos");
}
