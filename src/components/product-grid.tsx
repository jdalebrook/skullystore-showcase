"use client";

import { Suspense, useState, useTransition } from "react";
import { Grid2x2Icon } from "@/components/icons/grid2x2-icon";
import { Grid3x3Icon } from "@/components/icons/grid3x3-icon";
import { SquareIcon } from "@/components/icons/square-icon";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { ProductDetailModal } from "@/components/product-detail-modal";
import { setGridColumns } from "@/lib/actions/preferences";
import type { getProductsByCategoryId } from "@/lib/catalog";

type Product = Awaited<ReturnType<typeof getProductsByCategoryId>>[number];

const columnOptions = [
  { value: 1, label: "1 columna", icon: SquareIcon },
  { value: 2, label: "2 columnas", icon: Grid2x2Icon },
  { value: 3, label: "3 columnas", icon: Grid3x3Icon },
] as const;

const gridClassByColumns: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
};

export function ProductGrid({
  products,
  initialColumns,
  likedProductIds,
}: {
  products: Product[];
  initialColumns: number;
  likedProductIds?: Set<string>;
}) {
  const [columns, setColumns] = useState(initialColumns);
  const [, startTransition] = useTransition();

  function handleColumnsChange(value: number) {
    setColumns(value);
    startTransition(() => {
      setGridColumns(value);
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-end gap-1">
        {columnOptions.map((option) => (
          <Button
            key={option.value}
            variant={columns === option.value ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label={option.label}
            aria-pressed={columns === option.value}
            onClick={() => handleColumnsChange(option.value)}
          >
            <option.icon />
          </Button>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay productos en esta categoría.
        </p>
      ) : (
        <div className={`grid gap-4 ${gridClassByColumns[columns]}`}>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index === 0}
              isLiked={likedProductIds?.has(product.id) ?? false}
            />
          ))}
        </div>
      )}

      <Suspense fallback={null}>
        <ProductDetailModal products={products} likedProductIds={likedProductIds} />
      </Suspense>
    </div>
  );
}
