"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductGallery } from "@/components/product-gallery";
import { StockNotifyForm } from "@/components/stock-notify-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCents } from "@/lib/money";
import { trackEvent } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";
import type { getProductsByCategoryId } from "@/lib/catalog";

type Product = Awaited<ReturnType<typeof getProductsByCategoryId>>[number];

export function ProductDetailModal({
  products,
  likedProductIds,
}: {
  products: Product[];
  likedProductIds?: Set<string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const slug = searchParams.get("producto");
  const product = products.find((item) => item.slug === slug) ?? null;

  useEffect(() => {
    if (!product) return;
    trackEvent("view_item", {
      currency: siteConfig.currency,
      value: product.priceCents / 100,
      items: [{ item_id: product.id, item_name: product.name, price: product.priceCents / 100 }],
    });
  }, [product]);

  function handleOpenChange(open: boolean) {
    if (!open) {
      router.push(pathname, { scroll: false });
    }
  }

  return (
    <Dialog open={product !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {product && (
          <>
            <ProductGallery
              key={product.slug}
              images={product.images}
              productName={product.name}
              productId={product.id}
              initiallyLiked={likedProductIds?.has(product.id) ?? false}
            />

            <DialogHeader>
              <DialogTitle>{product.name}</DialogTitle>
              <DialogDescription>
                {product.description ?? product.shortDesc}
              </DialogDescription>
            </DialogHeader>

            <p className="text-xl font-semibold">
              {formatCents(product.priceCents)}
            </p>

            <DialogFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <AddToCartButton
                className="w-full sm:w-auto"
                outOfStock={product.stock <= 0}
                product={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  priceCents: product.priceCents,
                  imageUrl: product.images[0]?.url ?? null,
                }}
              />
              {product.stock <= 0 && (
                <StockNotifyForm
                  key={product.slug}
                  productId={product.id}
                  className="w-full sm:w-64"
                />
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
