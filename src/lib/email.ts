import nodemailer from "nodemailer";
import { formatCents } from "@/lib/money";
import { siteConfig } from "@/lib/site-config";

const smtpHost = process.env.SMTP_HOST;
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;

const transporter =
  smtpHost && smtpUser && smtpPassword
    ? nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT ?? 465),
        secure: (process.env.SMTP_SECURE ?? "true") === "true",
        auth: { user: smtpUser, pass: smtpPassword },
      })
    : null;

const FROM_EMAIL =
  process.env.SMTP_FROM_EMAIL ?? smtpUser ?? `${siteConfig.name} <noreply@example.com>`;

// Dirección donde se avisa al admin de pedidos nuevos y peticiones de aviso
// de stock -- configurable por si cambia, con el email real como valor por
// defecto.
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || siteConfig.contactEmail;

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!transporter) {
    console.warn(
      `SMTP no configurado: no se ha enviado el email de recuperación a ${to}. Enlace: ${resetUrl}`
    );
    return;
  }

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject: `Recupera tu contraseña en ${siteConfig.name}`,
    html: `
      <p>Has pedido restablecer tu contraseña.</p>
      <p><a href="${resetUrl}">Elige una contraseña nueva</a></p>
      <p>Si no has sido tú, puedes ignorar este email -- tu contraseña actual sigue siendo válida.</p>
      <p>El enlace caduca en 1 hora.</p>
    `,
  });
}

type OrderConfirmationAddress = {
  fullName: string;
  line1: string;
  line2?: string | null;
  city: string;
  province?: string | null;
  postalCode: string;
  country: string;
};

type OrderConfirmationItem = {
  nameSnapshot: string;
  quantity: number;
  unitPriceCents: number;
};

export async function sendOrderConfirmationEmail(
  to: string,
  order: {
    id: string;
    totalCents: number;
    items: OrderConfirmationItem[];
    address: OrderConfirmationAddress;
  }
) {
  if (!transporter) {
    console.warn(
      `SMTP no configurado: no se ha enviado el email de confirmación del pedido ${order.id} a ${to}.`
    );
    return;
  }

  const itemsHtml = order.items
    .map(
      (item) =>
        `<li>${item.quantity} × ${item.nameSnapshot} — ${formatCents(
          item.unitPriceCents * item.quantity
        )}</li>`
    )
    .join("");

  const addressLines = [
    order.address.fullName,
    [order.address.line1, order.address.line2].filter(Boolean).join(", "),
    `${order.address.postalCode} ${order.address.city}${order.address.province ? `, ${order.address.province}` : ""}`,
    order.address.country,
  ];

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject: `Confirmación de tu pedido #${order.id} — ${siteConfig.name}`,
    html: `
      <p>¡Gracias por tu compra! Hemos confirmado el pago de tu pedido.</p>
      <p><strong>Pedido:</strong> #${order.id}</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Total:</strong> ${formatCents(order.totalCents)}</p>
      <p><strong>Dirección de envío:</strong><br>${addressLines.join("<br>")}</p>
    `,
  });
}

export async function sendNewOrderAdminNotification(
  customerEmail: string,
  order: {
    id: string;
    totalCents: number;
    items: OrderConfirmationItem[];
  }
) {
  if (!transporter) {
    console.warn(
      `SMTP no configurado: no se ha enviado el aviso de pedido nuevo ${order.id} al admin.`
    );
    return;
  }

  const itemsHtml = order.items
    .map(
      (item) =>
        `<li>${item.quantity} × ${item.nameSnapshot} — ${formatCents(
          item.unitPriceCents * item.quantity
        )}</li>`
    )
    .join("");

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `Nuevo pedido #${order.id} — ${siteConfig.name}`,
    html: `
      <p>Nuevo pedido pagado.</p>
      <p><strong>Pedido:</strong> #${order.id}</p>
      <p><strong>Cliente:</strong> ${customerEmail}</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Total:</strong> ${formatCents(order.totalCents)}</p>
    `,
  });
}

export async function sendStockNotificationRequestEmail(
  product: { id: string; name: string },
  customerEmail: string
) {
  if (!transporter) {
    console.warn(
      `SMTP no configurado: no se ha enviado el aviso de petición de stock para "${product.name}" (${customerEmail}).`
    );
    return;
  }

  // Enlaza directo a la edición del producto en el admin (no hay una URL
  // pública fiable a un producto concreto fuera del contexto de su
  // categoría o del carrusel de destacados).
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `Petición de aviso de stock: ${product.name} — ${siteConfig.name}`,
    html: `
      <p>Alguien quiere que le avisen cuando vuelva a haber stock.</p>
      <p><strong>Producto:</strong> <a href="${baseUrl}/admin/productos/${product.id}">${product.name}</a></p>
      <p><strong>Email del cliente:</strong> ${customerEmail}</p>
    `,
  });
}

export async function sendLikeReminderEmail(
  to: string,
  product: {
    name: string;
    slug: string;
    categorySlug: string;
    priceCents: number;
    imageUrl: string | null;
  }
) {
  if (!transporter) {
    console.warn(
      `SMTP no configurado: no se ha enviado el recordatorio de "${product.name}" a ${to}.`
    );
    return;
  }

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const productUrl = `${baseUrl}/categoria/${product.categorySlug}?producto=${product.slug}`;
  // La imagen ya es same-origin (/uploads/...) o una URL externa completa
  // (picsum.photos en desarrollo) -- en ambos casos hace falta una URL
  // absoluta para que se vea embebida en el email.
  const imageUrl = product.imageUrl?.startsWith("/")
    ? `${baseUrl}${product.imageUrl}`
    : product.imageUrl;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject: `Sigue disponible: ${product.name} — ${siteConfig.name}`,
    html: `
      <p>Le diste like a este producto y todavía está disponible.</p>
      ${imageUrl ? `<p><a href="${productUrl}"><img src="${imageUrl}" alt="${product.name}" width="320" style="max-width:100%;height:auto;border-radius:8px"></a></p>` : ""}
      <p><strong><a href="${productUrl}">${product.name}</a></strong> — ${formatCents(product.priceCents)}</p>
    `,
  });
}
