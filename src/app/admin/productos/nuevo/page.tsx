import { prisma } from "@/lib/prisma";
import { createProduct } from "@/lib/actions/admin/products";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h2 className="mb-6 text-sm font-medium tracking-wide text-muted-foreground uppercase">
        Nuevo producto
      </h2>
      <ProductForm categories={categories} action={createProduct} submitLabel="Crear producto" />
    </div>
  );
}
