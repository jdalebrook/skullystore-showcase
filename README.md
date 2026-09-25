# SkullyStore

> 🟢 **Live in production:** [store.bskully.es](https://store.bskully.es) · Custom e-commerce built end-to-end by [Juan Dalebrook](https://github.com/jdalebrook): Next.js 16 · TypeScript · Prisma · PostgreSQL · Auth.js · PayPal · Docker

Tienda online a medida (sin Prestashop/Shopify), pensada para poco tráfico pero con mucho cuidado visual por producto. Construida con Next.js (App Router) + TypeScript, PostgreSQL/Prisma, Auth.js y PayPal.

Consulta [ROADMAP.md](./ROADMAP.md) para ver qué está hecho y qué falta, y [AGENTS.md](./AGENTS.md) para las decisiones de arquitectura y la guía de trabajo.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack) + Tailwind CSS v4 + shadcn/ui (sobre Base UI, no Radix)
- **PostgreSQL** + **Prisma 7** (driver adapter `@prisma/adapter-pg`, cliente generado en `src/generated/prisma`)
- **Auth.js v5** (NextAuth) con Credentials + estrategia JWT, roles `CUSTOMER` / `ADMIN`
- **PayPal Orders v2 API** (checkout sandbox)
- Docker Compose para Postgres en local; en producción, Docker Compose (app + Postgres propio) detrás de nginx (ya existente en el VPS, no Caddy)

## Requisitos

- Node.js 20+ y npm
- Docker Desktop (para Postgres local)

## Puesta en marcha

```bash
npm install

# Levanta Postgres local (puerto 5433, para no chocar con otro Postgres que tengas)
docker compose -f docker-compose.dev.yml up -d

# Copia el archivo de variables de entorno y rellena lo que falte
cp .env.example .env

# Aplica el esquema y siembra datos de prueba (categorías, productos, usuario admin)
npx prisma migrate dev
npx prisma db seed

npm run dev
```

Abre http://localhost:3000.

### Usuarios de prueba (tras el seed)

| Rol | Email | Contraseña |
|---|---|---|
| Admin | `admin@skullystore.dev` | `Admin1234!` |

Puedes registrar un usuario cliente normal desde `/registro`.

### Variables de entorno

Ver [`.env.example`](./.env.example). Resumen:

- `DATABASE_URL` — conexión a Postgres.
- `AUTH_SECRET` — clave para firmar las sesiones (genera una con `openssl rand -base64 32`).
- `PAYPAL_API_BASE`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID` — credenciales de tu app sandbox en el [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox). Sin ellas, el checkout funciona pero muestra un aviso de "PayPal no configurado" en vez del botón de pago.
- `PAYPAL_WEBHOOK_ID` — opcional. ID del webhook configurado en la misma app de PayPal (App → Add Webhook → `<tu-dominio>/api/paypal/webhook`, evento "Payment capture completed"), red de seguridad por si la captura síncrona del pago nunca llega al servidor. Sin ella, `/api/paypal/webhook` responde 503 pero el checkout normal funciona igual.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL` — para el email de recuperar contraseña, confirmación de pedido y avisos al admin, vía el buzón de correo de `bskully.es`. Sin `SMTP_USER`/`SMTP_PASSWORD`, esos emails se imprimen por consola en vez de enviarse.
- `ADMIN_NOTIFICATION_EMAIL` — dirección donde llegan los avisos al admin (pedido nuevo, petición de "avísame cuando repongáis stock"). Opcional, por defecto el email de contacto de `src/lib/site-config.ts`.
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — OAuth Client de [Google Cloud Console](https://console.cloud.google.com/apis/credentials) para "Continuar con Google". Redirect URI a autorizar: `<tu-dominio>/api/auth/callback/google`.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — API key de [Google Maps Platform](https://console.cloud.google.com/google/maps-apis) con la Places API habilitada, para autocompletar la dirección al añadirla en `/cuenta/direcciones`. Restríngela por HTTP referrer a tu dominio (es pública a propósito, se usa en el navegador). Requiere una cuenta de Google Cloud con facturación activada (tiene cuota gratuita mensual, normalmente de sobra para una tienda pequeña). Sin ella, el formulario funciona igual pero sin el buscador de autocompletado.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — ID de medición de [Google Analytics 4](https://analytics.google.com/) (`G-XXXXXXX`). Sin ella, no aparece ni el aviso de cookies ni se carga Analytics. Con ella configurada, el aviso de cookies pide consentimiento antes de cargar el script -- solo se activa si el visitante lo acepta.

La subida de imágenes de producto ("Subir imagen" en el admin) no necesita variables de entorno: guarda los archivos en `public/uploads/` (en producción, un volumen Docker aparte — ver `docker-compose.prod.yml`).

## Scripts

```bash
npm run dev      # servidor de desarrollo (Turbopack)
npm run build    # build de producción
npm run start    # sirve el build de producción
npm run lint     # ESLint

npx prisma studio       # explorador visual de la base de datos
npx prisma migrate dev  # crear/aplicar una migración tras tocar prisma/schema.prisma
npx prisma db seed      # volver a sembrar categorías/productos/usuario admin
npx tsx scripts/seed-test-user.ts  # crea un usuario cliente de prueba con dirección y carrito
```

## Estructura del proyecto

```
prisma/               esquema, migraciones y seed
src/
  app/                 rutas (App Router): tienda, cuenta, checkout, admin, API
  components/          componentes de UI, agrupados por área (auth/, admin/, checkout/, ui/)
  lib/                 acceso a datos, auth, integraciones (Prisma, Auth.js, PayPal)
    actions/           Server Actions, agrupadas por área
  generated/prisma/    cliente de Prisma generado (no se versiona)
  proxy.ts             protección de rutas /cuenta, /checkout, /admin (antes "middleware")
scripts/               scripts puntuales de datos para desarrollo
docker-compose.dev.yml Postgres local
```

## Despliegue

**En producción: https://store.bskully.es** (PayPal todavía en modo sandbox).

Dockerfile multi-stage (build standalone de Next.js) + `docker-compose.prod.yml` (app + Postgres propio, sin exponerse directamente a Internet). Runbook completo, config de nginx y notas de la infraestructura del VPS en [`deploy/`](./deploy/RUNBOOK.md).
