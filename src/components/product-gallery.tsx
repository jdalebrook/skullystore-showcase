"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon";
import { LikeButton } from "@/components/like-button";
import type { getProductsByCategoryId } from "@/lib/catalog";

type Product = Awaited<ReturnType<typeof getProductsByCategoryId>>[number];

export function ProductGallery({
  images,
  productName,
  productId,
  initiallyLiked,
}: {
  images: Product["images"];
  productName: string;
  productId: string;
  initiallyLiked: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  function goTo(index: number) {
    setActiveIndex((index + images.length) % images.length);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        {activeImage ? (
          <Image
            src={activeImage.url}
            alt={activeImage.alt ?? productName}
            fill
            sizes="(min-width: 640px) 32rem, 100vw"
            unoptimized={activeImage.url.startsWith("/uploads/")}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            Sin imagen
          </div>
        )}

        <LikeButton
          productId={productId}
          initiallyLiked={initiallyLiked}
          className="absolute top-3 right-3"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Imagen anterior"
              className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white transition-transform hover:scale-110"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Imagen siguiente"
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white transition-transform hover:scale-110"
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ver imagen ${index + 1} de ${productName}`}
              aria-current={index === activeIndex}
              className={`relative size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                index === activeIndex ? "border-foreground" : "border-transparent"
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="64px"
                unoptimized={image.url.startsWith("/uploads/")}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
