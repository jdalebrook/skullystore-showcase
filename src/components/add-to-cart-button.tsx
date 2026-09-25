"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/components/cart-provider";
import { trackEvent } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";

export function AddToCartButton({
  product,
  className,
  outOfStock = false,
}: {
  product: Omit<CartItem, "quantity">;
  className?: string;
  outOfStock?: boolean;
}) {
  const { addItem, openCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleClick() {
    addItem(product);
    openCart();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);

    trackEvent("add_to_cart", {
      currency: siteConfig.currency,
      value: product.priceCents / 100,
      items: [{ item_id: product.productId, item_name: product.name, price: product.priceCents / 100 }],
    });
  }

  if (outOfStock) {
    return (
      <Button className={className} variant="outline" disabled>
        Sin stock
      </Button>
    );
  }

  return (
    <Button className={className} onClick={handleClick}>
      {justAdded ? "Añadido ✓" : "Comprar"}
    </Button>
  );
}
