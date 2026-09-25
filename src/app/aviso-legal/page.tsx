import { LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: `Aviso legal — ${siteConfig.name}`,
  // No indexar: esta página lleva el NIF y domicilio real del titular, y no
  // hay razón para que aparezcan en resultados de búsqueda (la LSSI-CE exige
  // que el dato sea accesible al visitante, no que esté indexado). Se deja
  // rastrear (no hay Disallow en robots.ts) para que Google vea esta
  // etiqueta y de verdad la excluya del índice.
  robots: { index: false, follow: false },
};

export default function AvisoLegalPage() {
  return (
    <LegalPage title="Aviso legal" updated="12 de julio de 2026">
      <p>
        En cumplimiento del deber de información recogido en el artículo 10 de
        la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la
        Información y de Comercio Electrónico (LSSI-CE), se exponen los
        siguientes datos:
      </p>

      <h2>1. Datos identificativos</h2>
      <ul>
        <li>Titular: {siteConfig.legal.ownerName}</li>
        <li>NIF: {siteConfig.legal.nif}</li>
        <li>Domicilio: {siteConfig.legal.address}</li>
        <li>Correo de contacto: {siteConfig.legal.contactEmail}</li>
        <li>Nombre de dominio: {siteConfig.domain}</li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        {siteConfig.name} es una tienda online a través de la cual el titular
        ofrece la venta de productos de diseño propio. El acceso y uso de
        este sitio web atribuye la condición de usuario e implica la
        aceptación de las condiciones recogidas en este Aviso Legal.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        El usuario se compromete a hacer un uso adecuado de los contenidos y
        servicios del sitio web y a no emplearlos para incurrir en
        actividades ilícitas o contrarias a la buena fe, a la ley o al orden
        público.
      </p>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        Los textos, imágenes, diseños y demás contenidos de este sitio web
        son propiedad del titular o de terceros que han autorizado su uso, y
        están protegidos por la normativa de propiedad intelectual e
        industrial. Queda prohibida su reproducción total o parcial sin
        autorización expresa.
      </p>

      <h2>5. Legislación aplicable</h2>
      <p>
        Las presentes condiciones se rigen por la legislación española. Para
        cualquier controversia derivada del acceso o uso de este sitio web,
        las partes se someten a los juzgados y tribunales que resulten
        competentes conforme a derecho, sin perjuicio de los derechos que
        asisten a los consumidores como fuero de su domicilio.
      </p>
    </LegalPage>
  );
}
