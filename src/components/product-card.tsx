import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { LikeButton } from "@/components/like-button";
import { StockNotifyForm } from "@/components/stock-notify-form";
import { formatCents } from "@/lib/money";
import type { getProductsByCategoryId } from "@/lib/catalog";

type Product = Awaited<ReturnType<typeof getProductsByCategoryId>>[number];

const aspectByLayout: Record<string, string> = {
  poster: "aspect-[3/4]",
  compact: "aspect-square",
  default: "aspect-[4/5]",
};

export function ProductCard({
  product,
  priority = false,
  isLiked = false,
}: {
  product: Product;
  priority?: boolean;
  isLiked?: boolean;
}) {
  const primaryImage = product.images[0];
  const aspectClass = aspectByLayout[product.layoutVariant] ?? aspectByLayout.default;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <div
        className="h-1 w-full"
        style={{ backgroundColor: product.accentColor ?? "var(--border)" }}
        aria-hidden
      />

      <div className={`relative w-full ${aspectClass} bg-muted`}>
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            unoptimized={primaryImage.url.startsWith("/uploads/")}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            Sin imagen
          </div>
        )}

        {product.badgeText && (
          <Badge
            className="absolute top-3 left-3"
            style={{ backgroundColor: product.accentColor ?? undefined }}
          >
            {product.badgeText}
          </Badge>
        )}

        <LikeButton
          productId={product.id}
          initiallyLiked={isLiked}
          className="absolute top-3 right-3"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-heading text-base leading-snug font-medium">
          {product.name}
        </h3>
        {product.shortDesc && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.shortDesc}
          </p>
        )}
        <p className="mt-1 text-lg font-semibold">
          {formatCents(product.priceCents)}
        </p>

        <div className="mt-auto flex gap-2 pt-3">
          <AddToCartButton
            className="flex-1"
            outOfStock={product.stock <= 0}
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              imageUrl: primaryImage?.url ?? null,
            }}
          />
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`?producto=${product.slug}`} scroll={false} />}
          >
            Detalle
          </Button>
        </div>

        {product.stock <= 0 && (
          <StockNotifyForm productId={product.id} className="mt-2" />
        )}
      </div>
    </div>
  );
}
