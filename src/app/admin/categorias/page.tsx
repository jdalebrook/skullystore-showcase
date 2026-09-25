import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createCategory } from "@/lib/actions/admin/categories";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/components/admin/category-form";
import { DeleteCategoryButton } from "@/components/admin/delete-category-button";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="flex flex-col gap-10">
      {categories.length > 0 && (
        <ul className="flex flex-col gap-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 text-sm"
            >
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-muted-foreground">
                  /{category.slug} · {category._count.products} productos
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/admin/categorias/${category.id}`} />}
                >
                  Editar
                </Button>
                <DeleteCategoryButton categoryId={category.id} categoryName={category.name} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <div>
        <h2 className="mb-4 text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Nueva categoría
        </h2>
        <CategoryForm
          action={createCategory}
          submitLabel="Crear categoría"
          pendingLabel="Creando..."
          successMessage="Categoría creada."
        />
      </div>
    </div>
  );
}
