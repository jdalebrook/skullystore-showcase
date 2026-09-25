import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/lib/actions/admin/products";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const boundAction = updateProduct.bind(null, product.id);

  return (
    <div>
      <h2 className="mb-6 text-sm font-medium tracking-wide text-muted-foreground uppercase">
        Editar producto
      </h2>
      <ProductForm
        categories={categories}
        action={boundAction}
        submitLabel="Guardar cambios"
        defaults={{
          name: product.name,
          slug: product.slug,
          shortDesc: product.shortDesc ?? "",
          description: product.description ?? "",
          price: (product.priceCents / 100).toFixed(2),
          stock: String(product.stock),
          categoryId: product.categoryId,
          accentColor: product.accentColor ?? "",
          layoutVariant: product.layoutVariant,
          badgeText: product.badgeText ?? "",
          isActive: product.isActive,
          imageUrls: product.images.map((image) => image.url).join("\n"),
          weightGrams: product.weightGrams?.toString() ?? "",
          lengthCm: product.lengthCm?.toString() ?? "",
          widthCm: product.widthCm?.toString() ?? "",
          heightCm: product.heightCm?.toString() ?? "",
          vat: product.vatCents != null ? (product.vatCents / 100).toFixed(2) : "",
          shippingCost:
            product.shippingCostCents != null
              ? (product.shippingCostCents / 100).toFixed(2)
              : "",
        }}
      />
    </div>
  );
}
