"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const CategorySchema = z.object({
  name: z.string().trim().min(2, { error: "El nombre debe tener al menos 2 caracteres." }),
  slug: z
    .string()
    .trim()
    .min(2, { error: "El slug debe tener al menos 2 caracteres." })
    .regex(/^[a-z0-9-]+$/, {
      error: "Solo minúsculas, números y guiones (ej. accesorios-metal).",
    }),
  description: z.string().trim().optional(),
});

export type CategoryState =
  | {
      errors?: Record<string, string[]>;
    }
  | undefined;

// El slug es @unique en la BD -- sin esta comprobación, reutilizar uno ya
// existente lanzaría una violación de constraint sin explicación (mismo
// problema que se corrigió para deleteProduct con los pedidos).
async function findSlugConflict(slug: string, excludeId?: string): Promise<CategoryState> {
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing && existing.id !== excludeId) {
    return { errors: { slug: ["Ya existe una categoría con ese slug."] } };
  }
}

export async function createCategory(
  _prevState: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  await requireAdmin();

  const validatedFields = CategorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
  });

  if (!validatedFields.success) {
    return { errors: z.flattenError(validatedFields.error).fieldErrors };
  }

  const slugConflict = await findSlugConflict(validatedFields.data.slug);
  if (slugConflict) return slugConflict;

  await prisma.category.create({ data: validatedFields.data });

  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

export async function updateCategory(
  categoryId: string,
  _prevState: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  await requireAdmin();

  const validatedFields = CategorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
  });

  if (!validatedFields.success) {
    return { errors: z.flattenError(validatedFields.error).fieldErrors };
  }

  const slugConflict = await findSlugConflict(validatedFields.data.slug, categoryId);
  if (slugConflict) return slugConflict;

  await prisma.category.update({ where: { id: categoryId }, data: validatedFields.data });

  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

export type DeleteCategoryState = { error?: string } | undefined;

export async function deleteCategory(
  categoryId: string,
  _prevState: DeleteCategoryState,
  _formData: FormData
): Promise<DeleteCategoryState> {
  await requireAdmin();

  // Se devuelve el error en vez de lanzarlo -- Next.js oculta el mensaje de
  // los errores lanzados desde una Server Action en producción, así que un
  // throw aquí llegaría al admin como un fallo genérico sin explicación
  // (mismo problema que se corrigió para deleteProduct con los pedidos).
  const productCount = await prisma.product.count({ where: { categoryId } });
  if (productCount > 0) {
    return {
      error: "No se puede eliminar una categoría con productos. Muévelos o elimínalos primero.",
    };
  }

  await prisma.category.delete({ where: { id: categoryId } });

  revalidatePath("/admin/categorias");
  revalidatePath("/");
}
