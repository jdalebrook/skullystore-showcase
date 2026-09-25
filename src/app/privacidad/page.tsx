import { LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: `Política de privacidad — ${siteConfig.name}`,
  // Ver aviso-legal/page.tsx: mismo criterio, esta página también expone
  // datos identificativos del titular.
  robots: { index: false, follow: false },
};

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de privacidad" updated="12 de julio de 2026">
      <p>
        Esta política explica qué datos personales recoge {siteConfig.name}, con
        qué finalidad y qué derechos tienes al respecto, conforme al
        Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>Titular: {siteConfig.legal.ownerName}</li>
        <li>NIF: {siteConfig.legal.nif}</li>
        <li>Domicilio: {siteConfig.legal.address}</li>
        <li>Correo de contacto: {siteConfig.legal.contactEmail}</li>
      </ul>

      <h2>2. Qué datos recogemos</h2>
      <p>Según cómo uses la tienda, podemos tratar:</p>
      <ul>
        <li>Datos de cuenta: nombre y correo electrónico.</li>
        <li>
          Datos de envío: nombre completo, dirección postal, teléfono, país.
        </li>
        <li>
          Datos de pedidos: productos comprados, importes, estado del pedido.
        </li>
        <li>
          Datos de pago: gestionados directamente por PayPal — {siteConfig.name} no
          almacena datos de tarjetas ni credenciales de pago.
        </li>
      </ul>

      <h2>3. Finalidad y base legal</h2>
      <ul>
        <li>
          Gestionar tu cuenta y tramitar tus pedidos (ejecución de un
          contrato).
        </li>
        <li>
          Enviarte comunicaciones estrictamente necesarias sobre tu pedido o
          tu cuenta, como el email de recuperación de contraseña (interés
          legítimo / ejecución de un contrato).
        </li>
        <li>
          Cumplir con obligaciones legales (por ejemplo, facturación y
          conservación de registros fiscales).
        </li>
      </ul>

      <h2>4. Con quién compartimos tus datos</h2>
      <p>
        Solo con los proveedores estrictamente necesarios para prestar el
        servicio: PayPal (procesamiento de pagos) y el proveedor de correo
        que envía los emails transaccionales de la tienda. No vendemos ni
        cedemos tus datos a terceros con fines publicitarios.
      </p>

      <h2>5. Conservación de los datos</h2>
      <p>
        Conservamos los datos de tu cuenta mientras esté activa, y los datos
        de pedidos durante el plazo exigido por la normativa fiscal y
        mercantil aplicable.
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión,
        oposición, portabilidad y limitación del tratamiento escribiendo a{" "}
        {siteConfig.legal.contactEmail}. También tienes derecho a presentar
        una reclamación ante la Agencia Española de Protección de Datos
        (
        <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
          www.aepd.es
        </a>
        ) si consideras que el tratamiento de tus datos no se ajusta a la
        normativa.
      </p>
    </LegalPage>
  );
}
