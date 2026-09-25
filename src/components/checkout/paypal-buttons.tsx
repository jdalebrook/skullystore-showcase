"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createOrderFromCart, captureOrder } from "@/lib/actions/checkout";
import { useCart } from "@/components/cart-provider";

type PayPalButtonsInstance = {
  render: (container: HTMLElement) => void;
};

type PayPalButtonsOptions = {
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onError?: (error: unknown) => void;
};

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: PayPalButtonsOptions) => PayPalButtonsInstance;
    };
  }
}

export function PayPalCheckoutButtons({ addressId }: { addressId: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkFailed, setSdkFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { clear } = useCart();

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  useEffect(() => {
    // El SDK puede haberse cargado ya en una visita anterior a esta pestaña
    // (navegación hacia atrás/adelante, volver a /checkout) -- en ese caso
    // next/script no vuelve a disparar "onLoad" para este montaje nuevo del
    // componente, y sdkReady se quedaría en false para siempre sin este
    // chequeo (el bug real: había que recargar la página a mano para que
    // apareciera el botón).
    if (window.paypal) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSdkReady(true);
    }
  }, []);

  useEffect(() => {
    if (!sdkReady || !addressId || !containerRef.current || !window.paypal) {
      return;
    }

    containerRef.current.innerHTML = "";
    window.paypal
      .Buttons({
        createOrder: async () => {
          setError(null);
          const result = await createOrderFromCart(addressId);
          if (!result.paypalOrderId) {
            const message = result.error ?? "No se ha podido iniciar el pago.";
            setError(message);
            // Aborta el flujo de PayPal con nuestro propio mensaje ya
            // visible -- su onError también saltará, pero no pisa un
            // mensaje que ya hemos puesto (ver más abajo).
            throw new Error(message);
          }
          return result.paypalOrderId;
        },
        onApprove: async (data) => {
          const result = await captureOrder(data.orderID);
          if (!result.orderId) {
            setError(result.error ?? "No se ha podido confirmar el pedido.");
            return;
          }
          // El servidor ya ha vaciado el Cart de BD al capturar el pago --
          // esto vacía también el carrito local (localStorage) para que no
          // se sigan viendo los productos ya comprados.
          clear();
          router.push(`/checkout/confirmacion/${result.orderId}`);
        },
        onError: () => {
          // Si createOrder ya puso un mensaje concreto (carrito vacío, sin
          // stock...), se deja tal cual -- este genérico es solo para fallos
          // del propio PayPal (red, pago rechazado...).
          setError((current) => current ?? "Ha ocurrido un error con el pago. Inténtalo de nuevo.");
        },
      })
      .render(containerRef.current);
    // "clear" cambia de referencia cada vez que el carrito cambia (viene del
    // useMemo de CartProvider) -- incluirlo aquí destruiría y recrearía los
    // botones de PayPal en cuanto se vacíe el carrito, justo lo que hace
    // este mismo efecto al completar la compra.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady, addressId, router]);

  if (!clientId) {
    return (
      <p className="text-sm text-muted-foreground">
        El pago con PayPal todavía no está configurado en este entorno.
      </p>
    );
  }

  return (
    <div>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR`}
        onLoad={() => setSdkReady(true)}
        onError={() => setSdkFailed(true)}
      />
      {!addressId && (
        <p className="mb-2 text-sm text-muted-foreground">
          Selecciona una dirección de envío para continuar.
        </p>
      )}
      {sdkFailed && (
        <p className="mb-2 text-sm text-destructive">
          No se ha podido cargar el sistema de pago de PayPal. Puede ser un
          problema temporal de conexión, o que las credenciales configuradas
          no sean válidas -- contacta con nosotros si el problema persiste.
        </p>
      )}
      {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
      <div ref={containerRef} />
    </div>
  );
}
