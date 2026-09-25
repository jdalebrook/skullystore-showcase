import { LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: `Política de cookies — ${siteConfig.name}`,
  // Ver aviso-legal/page.tsx: mismo criterio, esta página también expone
  // datos identificativos del titular.
  robots: { index: false, follow: false },
};

export default function CookiesPage() {
  return (
    <LegalPage title="Política de cookies" updated="13 de julio de 2026">
      <p>
        Una cookie es un pequeño archivo que se guarda en tu navegador. En{" "}
        {siteConfig.name} usamos cookies técnicas, necesarias para el
        funcionamiento básico de la tienda, y cookies de analítica (Google
        Analytics) para entender cómo se usa la tienda — estas últimas solo
        se activan si das tu consentimiento en el aviso que aparece en tu
        primera visita.
      </p>

      <h2>Cookies técnicas (siempre activas)</h2>
      <ul>
        <li>
          <strong>Sesión de usuario</strong>: para mantenerte identificado
          tras iniciar sesión y proteger el formulario de inicio de sesión
          frente a manipulaciones.
        </li>
        <li>
          <strong>Preferencia de columnas del catálogo</strong>: recuerda si
          prefieres ver los productos en 1, 2 o 3 columnas.
        </li>
      </ul>

      <h2>Cookies de analítica (requieren tu consentimiento)</h2>
      <p>
        Si aceptas el aviso de cookies, cargamos Google Analytics 4, que
        instala cookies propias (<code>_ga</code>, <code>_ga_*</code>) para
        distinguir visitas y entender qué páginas y productos se consultan
        más. No usamos esta información para identificarte personalmente ni
        la compartimos con fines publicitarios.
      </p>
      <p>
        Puedes cambiar tu decisión en cualquier momento desde
        &ldquo;Preferencias de cookies&rdquo;, al pie de cualquier página.
      </p>

      <p>
        El carrito de la compra, mientras no inicies el pago, se guarda en tu
        navegador (localStorage) y no en una cookie — funciona igual, pero
        técnicamente es un mecanismo distinto y no se envía a ningún
        servidor hasta que confirmas la compra.
      </p>

      <h2>Cookies de terceros</h2>
      <p>
        Al pagar con PayPal, PayPal puede establecer sus propias cookies
        conforme a su{" "}
        <a
          href="https://www.paypal.com/es/webapps/mpp/ua/privacy-full"
          target="_blank"
          rel="noopener noreferrer"
        >
          política de privacidad
        </a>
        . {siteConfig.name} no tiene control sobre esas cookies.
      </p>

      <h2>Cómo gestionar las cookies</h2>
      <p>
        Las cookies técnicas son estrictamente necesarias para el
        funcionamiento del sitio y no requieren tu consentimiento previo. Las
        de analítica solo se activan si las aceptas, y puedes retirar tu
        consentimiento en cualquier momento desde &ldquo;Preferencias de
        cookies&rdquo;. También puedes eliminar o bloquear cualquier cookie
        desde la configuración de tu navegador, teniendo en cuenta que
        algunas funciones (como mantener la sesión iniciada) dejarán de
        funcionar correctamente si bloqueas las técnicas.
      </p>
    </LegalPage>
  );
}
