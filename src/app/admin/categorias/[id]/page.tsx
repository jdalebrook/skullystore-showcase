import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCategory } from "@/lib/actions/admin/categories";
import { CategoryForm } from "@/components/admin/category-form";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    notFound();
  }

  const boundAction = updateCategory.bind(null, category.id);

  return (
    <div>
      <h2 className="mb-6 text-sm font-medium tracking-wide text-muted-foreground uppercase">
        Editar categoría
      </h2>
      <CategoryForm
        action={boundAction}
        submitLabel="Guardar cambios"
        pendingLabel="Guardando..."
        successMessage="Categoría actualizada."
        defaults={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
        }}
      />
    </div>
  );
}
