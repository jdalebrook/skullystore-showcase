declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// No-op si GA4 no está cargado (sin NEXT_PUBLIC_GA_MEASUREMENT_ID, o sin
// consentimiento todavía) -- mismo criterio de degradación que el resto de
// integraciones externas del proyecto.
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}
