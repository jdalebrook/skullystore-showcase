"use client";

import Image from "next/image";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MinusIcon } from "@/components/icons/minus-icon";
import { PlusIcon } from "@/components/icons/plus-icon";
import { ShoppingCartIcon } from "@/components/icons/shopping-cart-icon";
import { XIcon } from "@/components/icons/x-icon";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCart } from "@/components/cart-provider";
import { formatCents } from "@/lib/money";
import { syncServerCart } from "@/lib/actions/cart";
import { trackEvent } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";

export function CartDrawer() {
  const { items, itemCount, subtotalCents, removeItem, setQuantity, isOpen, setOpen } =
    useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleCheckout() {
    startTransition(async () => {
      const { removedProductIds } = await syncServerCart(
        items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
      );

      if (removedProductIds.length > 0) {
        removedProductIds.forEach((productId) => removeItem(productId));
        toast.error(
          "Algunos productos de tu carrito ya no están disponibles y se han quitado. Revisa el carrito antes de continuar."
        );
        // Se deja el panel abierto a propósito para que vean el aviso y el
        // carrito ya actualizado, en vez de navegar con el carrito a medias.
        return;
      }

      trackEvent("begin_checkout", {
        currency: siteConfig.currency,
        value: subtotalCents / 100,
        items: items.map((item) => ({
          item_id: item.productId,
          item_name: item.name,
          price: item.priceCents / 100,
          quantity: item.quantity,
        })),
      });

      setOpen(false);
      router.push("/checkout");
    });
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir carrito"
            className="relative"
          />
        }
      >
        <ShoppingCartIcon />
        {itemCount > 0 && (
          <Badge className="absolute -top-1 -right-1" variant="default">
            {itemCount}
          </Badge>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[88vw] flex-col sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Tu carrito</SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? "Todavía no has añadido ningún producto."
              : `${itemCount} artículo${itemCount === 1 ? "" : "s"}`}
          </SheetDescription>
        </SheetHeader>

        {items.length > 0 && (
          <div className="flex-1 overflow-y-auto px-4">
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="64px"
                        unoptimized={item.imageUrl.startsWith("/uploads/")}
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{item.name}</p>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Quitar del carrito"
                        onClick={() => removeItem(item.productId)}
                      >
                        <XIcon />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatCents(item.priceCents)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon-xs"
                        aria-label="Restar unidad"
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      >
                        <MinusIcon />
                      </Button>
                      <span className="w-4 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        aria-label="Sumar unidad"
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <SheetFooter>
          {items.length > 0 && (
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Subtotal</span>
              <span>{formatCents(subtotalCents)}</span>
            </div>
          )}
          <Button
            disabled={items.length === 0 || isPending}
            onClick={handleCheckout}
            className="w-full"
          >
            {isPending ? "Preparando..." : "Finalizar compra"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
