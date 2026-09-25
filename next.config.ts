import type { NextConfig } from "next";

// CSP sin nonces: todas las rutas ya son dinámicas (auth() en el header), pero
// los colores de acento por producto usan `style` inline y necesitan
// 'unsafe-inline' en style-src. Ver AGENTS.md para el porqué y el plan de
// endurecer a nonces cuando se pueda probar en un navegador real.
// picsum.photos es solo el placeholder de desarrollo.
// maps.googleapis.com / maps.gstatic.com / places.googleapis.com /
// fonts.googleapis.com / fonts.gstatic.com son para el autocompletado de
// direcciones con Google Places (GoogleAddressAutocomplete) -- solo se cargan
// si NEXT_PUBLIC_GOOGLE_MAPS_API_KEY está configurada. El widget
// <gmp-place-autocomplete> llama de verdad a places.googleapis.com (no solo
// a maps.googleapis.com, que es donde se carga el script) y además carga sus
// propias hojas de estilo de Google Fonts -- sin estos dominios, el widget
// carga pero las peticiones de autocompletado fallan en silencio (bloqueadas
// por la CSP) y no se ve ninguna sugerencia al escribir.
// www.sandbox.paypal.com en connect-src es para una llamada interna de
// logging/telemetría del SDK de PayPal en modo sandbox (xoplatform/logger) --
// solo hace falta mientras se use sandbox; al pasar a Live probablemente ya
// no se necesite (pero no molesta dejarlo).
// googletagmanager.com / google-analytics.com son para Google Analytics 4
// (CookieConsentBanner) -- el script solo se inyecta si el visitante acepta
// el aviso de cookies, pero el dominio tiene que estar permitido en la CSP
// desde el principio o el navegador lo bloquea en cuanto se intenta cargar.
const isDev = process.env.NODE_ENV === "development";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.paypal.com https://www.paypalobjects.com https://www.sandbox.paypal.com https://maps.googleapis.com https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https://picsum.photos https://www.paypalobjects.com https://maps.gstatic.com https://maps.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://api-m.paypal.com https://api-m.sandbox.paypal.com https://www.paypal.com https://www.sandbox.paypal.com https://maps.googleapis.com https://places.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com;
  frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
