"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  requestStockNotification,
  type StockNotificationState,
} from "@/lib/actions/stock-notifications";

const initialState: StockNotificationState = undefined;

export function StockNotifyForm({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(requestStockNotification, initialState);

  if (state?.message) {
    return <p className={`text-sm text-muted-foreground ${className ?? ""}`}>{state.message}</p>;
  }

  return (
    <form action={formAction} className={`flex gap-2 ${className ?? ""}`}>
      <input type="hidden" name="productId" value={productId} />
      <Input
        type="email"
        name="email"
        placeholder="Tu email"
        required
        className="h-8 flex-1 text-sm"
      />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "..." : "Avísame"}
      </Button>
    </form>
  );
}
