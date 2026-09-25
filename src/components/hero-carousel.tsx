"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { LikeButton } from "@/components/like-button";
import { StockNotifyForm } from "@/components/stock-notify-form";
import { formatCents } from "@/lib/money";
import type { getFeaturedProducts } from "@/lib/catalog";

type Product = Awaited<ReturnType<typeof getFeaturedProducts>>[number];

const AUTOSLIDE_MS = 5000;

// Se funde a transparente en el último 25% del ancho (de derecha a
// izquierda), para que la imagen no corte en seco contra el panel de texto.
const FADE_MASK =
  "linear-gradient(to right, black 0%, black 75%, transparent 100%)";

export function HeroCarousel({
  products,
  likedProductIds,
}: {
  products: Product[];
  likedProductIds?: Set<string>;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || products.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % products.length);
    }, AUTOSLIDE_MS);
    return () => clearInterval(timer);
  }, [paused, products.length]);

  if (products.length === 0) return null;

  const product = products[index];
  const image = product.images[0];

  return (
    <section className="mx-auto my-8 w-[90%] max-w-6xl">
      <div
        className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card sm:flex-row sm:aspect-[21/9]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <Link
          href={`?producto=${product.slug}`}
          scroll={false}
          aria-label={`Ver detalle de ${product.name}`}
          className="group relative aspect-[4/3] w-full shrink-0 overflow-hidden sm:aspect-auto sm:w-3/5"
        >
          {image ? (
            <Image
              src={image.url}
              alt={image.alt ?? product.name}
              fill
              priority
              sizes="(min-width: 1024px) 54vw, 90vw"
              unoptimized={image.url.startsWith("/uploads/")}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
              Sin imagen
            </div>
          )}

          <LikeButton
            productId={product.id}
            initiallyLiked={likedProductIds?.has(product.id) ?? false}
            className="absolute top-3 right-3"
          />
        </Link>

        <div
          className="flex w-full flex-col justify-center gap-3 p-6 sm:w-2/5 sm:p-8"
          style={{
            backgroundColor: product.accentColor ? `${product.accentColor}14` : undefined,
          }}
        >
          <h2 className="font-heading text-xl leading-snug font-semibold sm:text-2xl">
            {product.name}
          </h2>
          {(product.shortDesc ?? product.description) && (
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {product.shortDesc ?? product.description}
            </p>
          )}
          <p className="text-lg font-semibold">{formatCents(product.priceCents)}</p>

          <AddToCartButton
            className="mt-2 w-fit"
            outOfStock={product.stock <= 0}
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              imageUrl: image?.url ?? null,
            }}
          />
          {product.stock <= 0 && (
            <StockNotifyForm key={product.id} productId={product.id} className="mt-1 max-w-xs" />
          )}
        </div>
      </div>

      {products.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {products.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Ir al producto ${itemIndex + 1}`}
              aria-current={itemIndex === index}
              onClick={() => setIndex(itemIndex)}
              className={`size-2.5 rounded-full transition-colors ${
                itemIndex === index ? "bg-foreground" : "bg-border"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
