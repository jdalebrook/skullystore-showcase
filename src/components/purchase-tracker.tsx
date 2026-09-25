"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";

type PurchaseItem = {
  productId: string;
  nameSnapshot: string;
  unitPriceCents: number;
  quantity: number;
};

export function PurchaseTracker({
  orderId,
  totalCents,
  items,
}: {
  orderId: string;
  totalCents: number;
  items: PurchaseItem[];
}) {
  // Evita contar la misma compra dos veces si se recarga esta página --
  // GA4 también deduplica por transaction_id, esto es un cinturón extra.
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    trackEvent("purchase", {
      transaction_id: orderId,
      currency: siteConfig.currency,
      value: totalCents / 100,
      items: items.map((item) => ({
        item_id: item.productId,
        item_name: item.nameSnapshot,
        price: item.unitPriceCents / 100,
        quantity: item.quantity,
      })),
    });
  }, [orderId, totalCents, items]);

  return null;
}
