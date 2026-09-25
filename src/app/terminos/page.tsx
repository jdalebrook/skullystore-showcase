import { LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: `Términos y condiciones — ${siteConfig.name}`,
  // Ver aviso-legal/page.tsx: mismo criterio, esta página también expone
  // datos identificativos del titular.
  robots: { index: false, follow: false },
};

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y condiciones de compra" updated="12 de julio de 2026">
      <p>
        Estas condiciones regulan la compra de productos a través de{" "}
        {siteConfig.name}. Al finalizar un pedido, el cliente declara haberlas
        leído y aceptado.
      </p>

      <h2>1. Proceso de compra</h2>
      <p>
        Los productos se añaden al carrito y, al finalizar la compra, se
        confirma la dirección de envío y se procede al pago. El pedido se
        considera realizado en el momento en que se confirma el pago.
      </p>

      <h2>2. Precios e impuestos</h2>
      <p>
        Los precios se muestran en euros (€) e incluyen los impuestos
        aplicables. Los gastos de envío, si los hubiera, se indican antes de
        confirmar el pedido.
      </p>

      <h2>3. Métodos de pago</h2>
      <p>
        El pago se procesa de forma segura a través de PayPal. {siteConfig.name} no
        accede ni almacena los datos de la tarjeta o cuenta con la que se
        paga.
      </p>

      <h2>4. Envíos</h2>
      <p>
        Los plazos de entrega son estimados y se comunican durante el
        proceso de compra. {siteConfig.name} no se hace responsable de retrasos
        causados por el transportista o por causas de fuerza mayor.
      </p>

      <h2>5. Derecho de desistimiento</h2>
      <p>
        Conforme al Real Decreto Legislativo 1/2007, el cliente dispone de
        <strong> 14 días naturales</strong> desde la recepción del pedido
        para desistir de la compra sin necesidad de justificación,
        escribiendo a {siteConfig.legal.contactEmail}. El producto debe
        devolverse en su estado original. Los gastos de devolución corren a
        cargo del cliente salvo que el producto sea defectuoso o incorrecto.
      </p>

      <h2>6. Garantías</h2>
      <p>
        Todos los productos cuentan con la garantía legal de conformidad
        prevista en la normativa de consumo aplicable. Si recibes un producto
        defectuoso o distinto al pedido, contacta con nosotros en{" "}
        {siteConfig.legal.contactEmail}.
      </p>

      <h2>7. Reclamaciones</h2>
      <p>
        Puedes dirigir cualquier reclamación a {siteConfig.legal.contactEmail}. Como
        consumidor de la Unión Europea, también puedes
        acceder a la plataforma de resolución de litigios en línea de la
        Comisión Europea en{" "}
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
        >
          ec.europa.eu/consumers/odr
        </a>
        .
      </p>
    </LegalPage>
  );
}
