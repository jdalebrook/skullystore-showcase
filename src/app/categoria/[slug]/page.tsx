import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getCategoryBySlug, getLikedProductIds, getProductsByCategoryId } from "@/lib/catalog";
import { ProductGrid } from "@/components/product-grid";
import { auth } from "@/lib/auth";

const DEFAULT_COLUMNS = 2;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [products, cookieStore, session] = await Promise.all([
    getProductsByCategoryId(category.id),
    cookies(),
    auth(),
  ]);

  const likedProductIds = await getLikedProductIds(
    session?.user?.id,
    products.map((product) => product.id)
  );

  const cookieColumns = Number(cookieStore.get("grid-columns")?.value);
  const initialColumns = [1, 2, 3].includes(cookieColumns)
    ? cookieColumns
    : DEFAULT_COLUMNS;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        {category.name}
      </h1>
      {category.description && (
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {category.description}
        </p>
      )}

      <div className="mt-8">
        <ProductGrid
          products={products}
          initialColumns={initialColumns}
          likedProductIds={likedProductIds}
        />
      </div>
    </div>
  );
}
