// Identidad de la tienda en un único sitio -- para clonar SkullyStore como
// base de otra tienda (otro nicho, otro titular), esto es lo que hay que
// rellenar de nuevo. No cubre moneda/precio (`currency=EUR` del SDK de
// PayPal y los rótulos "(€)" del formulario de producto siguen fijos --
// cambiar de moneda implica revisar todo el flujo de precios, no solo
// textos) ni el favicon (`src/app/favicon.ico`, un archivo binario).
export const siteConfig = {
  name: "SkullyStore",
  description: "Productos con carácter, cuidados uno a uno.",
  domain: "store.bskully.es",
  contactEmail: "juan@dalebrook.org",
  currency: "EUR",
  locale: "es-ES",
  logoPath: "/logo.png",
  legal: {
    ownerName: "Your Name",
    nif: "00000000X",
    address: "Street 1, 00000 City, Spain",
    // Distinto de contactEmail (ese es el operativo: avisos de stock,
    // pedidos nuevos) -- este es el que se muestra en las páginas legales
    // para derechos RGPD, devoluciones y reclamaciones.
    contactEmail: "legal@bskully.es",
  },
};
