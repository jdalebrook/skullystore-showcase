import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

// No bloqueamos las páginas legales aquí: si Googlebot no puede ni
// rastrearlas, tampoco ve la etiqueta `noindex` que llevan (ver metadata de
// cada página en app/{aviso-legal,privacidad,cookies,terminos}) y la URL
// podría seguir apareciendo en resultados de búsqueda sin snippet. La
// exclusión de esas páginas del índice se hace con `noindex`, no con
// Disallow -- este archivo solo bloquea rutas que no tienen valor para
// ningún buscador (admin, API) y bots de scraping conocidos que no
// respetan `noindex` pero sí honran robots.txt.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      {
        // Bots de scraping SEO/comercial (no motores de búsqueda de uso
        // real) que solo sirven para volcar el contenido del sitio a
        // terceros -- sin beneficio para nosotros, y menos exposición de
        // los datos legales cuanto menos volcado del sitio circule.
        userAgent: [
          "AhrefsBot",
          "SemrushBot",
          "MJ12bot",
          "DotBot",
          "PetalBot",
          "DataForSeoBot",
        ],
        disallow: "/",
      },
    ],
    host: siteConfig.domain,
  };
}