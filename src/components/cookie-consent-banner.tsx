"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";

export const COOKIE_CONSENT_KEY = "skullystore-cookie-consent";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

type Consent = "accepted" | "rejected" | null;

export function CookieConsentBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hidratación desde localStorage tras el montaje -- necesaria porque no
    // está disponible durante el render en servidor (mismo patrón que
    // CartProvider).
    const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored === "accepted" || stored === "rejected") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConsent(stored);
    }
    setHydrated(true);

    // "Preferencias de cookies" en el footer borra la clave y dispara este
    // evento para volver a mostrar el banner sin recargar la página.
    function onReset() {
      setConsent(null);
    }
    window.addEventListener("skullystore:cookie-consent-reset", onReset);
    return () => window.removeEventListener("skullystore:cookie-consent-reset", onReset);
  }, []);

  function decide(value: "accepted" | "rejected") {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    setConsent(value);
  }

  // Sin GA_MEASUREMENT_ID configurado no hay nada que pedir consentir.
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      {consent === "accepted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}

      {hydrated && consent === null && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background p-4 shadow-lg">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Usamos cookies de analítica para entender cómo se usa la tienda.
              Puedes aceptarlas o rechazarlas -- ver{" "}
              <Link href="/cookies" className="underline">
                política de cookies
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => decide("rejected")}>
                Rechazar
              </Button>
              <Button size="sm" onClick={() => decide("accepted")}>
                Aceptar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
