import Link from "next/link";
import { Suspense } from "react";
import { getFeaturedProducts, getLikedProductIds, getTopLevelCategories } from "@/lib/catalog";
import { auth } from "@/lib/auth";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductDetailModal } from "@/components/product-detail-modal";
import { siteConfig } from "@/lib/site-config";

export default async function Home() {
  const [categories, featuredProducts, session] = await Promise.all([
    getTopLevelCategories(),
    getFeaturedProducts(),
    auth(),
  ]);

  const likedProductIds = await getLikedProductIds(
    session?.user?.id,
    featuredProducts.map((product) => product.id)
  );

  return (
    <div className="py-8">
      {featuredProducts.length > 0 && (
        <>
          <HeroCarousel products={featuredProducts} likedProductIds={likedProductIds} />
          <Suspense fallback={null}>
            <ProductDetailModal
              products={featuredProducts}
              likedProductIds={likedProductIds}
            />
          </Suspense>
        </>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-16 max-w-2xl">
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            {siteConfig.name}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {siteConfig.description} Explora nuestras categorías.
          </p>
        </section>

        <section>
          <h2 className="mb-6 text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Categorías
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categoria/${category.slug}`}
                className="group rounded-xl border border-border p-6 transition-colors hover:border-foreground/30 hover:bg-muted/40"
              >
                <h3 className="font-heading text-lg font-medium">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
                <span className="mt-4 inline-block text-sm font-medium text-foreground/70 group-hover:text-foreground">
                  Ver productos →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
