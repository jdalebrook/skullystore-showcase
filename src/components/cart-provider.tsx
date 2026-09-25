"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "skullystore-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // Hidratación desde localStorage tras el montaje: necesaria para que el
        // primer render coincida con el HTML del servidor y no haya mismatch.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(JSON.parse(raw));
      }
    } catch {
      // localStorage no disponible o datos corruptos: seguimos con carrito vacío.
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hasLoaded]);

  const value = useMemo<CartContextValue>(() => {
    function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
      setItems((current) => {
        const existing = current.find((i) => i.productId === item.productId);
        if (existing) {
          return current.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...current, { ...item, quantity }];
      });
    }

    function removeItem(productId: string) {
      setItems((current) => current.filter((i) => i.productId !== productId));
    }

    function setQuantity(productId: string, quantity: number) {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((current) =>
        current.map((i) => (i.productId === productId ? { ...i, quantity } : i))
      );
    }

    function clear() {
      setItems([]);
    }

    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotalCents = items.reduce(
      (sum, i) => sum + i.priceCents * i.quantity,
      0
    );

    return {
      items,
      itemCount,
      subtotalCents,
      addItem,
      removeItem,
      setQuantity,
      clear,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      setOpen: setIsOpen,
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
}
