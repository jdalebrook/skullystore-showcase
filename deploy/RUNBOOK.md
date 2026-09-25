# Runbook de despliegue — VPS bskully.es

VPS compartido con Antitropic Cards y Skully Survivors. SkullyStore usa su propio contenedor de Postgres (no comparte el de los juegos) y su propio bloque de nginx, siguiendo el mismo patrón que ya usan los otros dos proyectos.

## Primera vez

1. **Clonar el repo en la VPS** (fuera de `/root` si se prefiere separar por convención, pero basta con seguir el mismo sitio donde están Cards/Survivors):
   ```bash
   git clone https://github.com/jdalebrook/skullystore-showcase.git
   cd skullystore-showcase
   ```

2. **Crear el `.env` de producción** a partir de la plantilla:
   ```bash
   cp .env.production.example .env
   ```
   Rellenar `DB_PASSWORD` (nuevo, distinto al de los juegos), `AUTH_SECRET` (`openssl rand -base64 32`, distinto al de desarrollo) y las credenciales **Live** de PayPal (no las de sandbox) desde el dashboard de PayPal Developer.

   **Si esta instancia es un clon para otra tienda/nicho** (mismo dueño, otro catálogo), rellenar también `src/lib/site-config.ts` (nombre, email de contacto, datos legales del titular, logo, moneda/locale) antes de construir la imagen -- es la única fuente de verdad para la identidad de la tienda en el código. Revisar el contenido de las páginas legales igualmente, por si el texto en sí (no solo los datos de `siteConfig`) necesita cambios para el nuevo negocio.

3. **Levantar solo la base de datos** (todavía no `app` -- no tiene sentido arrancarla contra un esquema que no existe):
   ```bash
   docker compose -f docker-compose.prod.yml up -d db
   ```

4. **Aplicar el esquema de base de datos**. La imagen final de la app es mínima y no trae el CLI de Prisma, así que esto se hace con el servicio `migrate` (usa la etapa de build con `node_modules` completo):
   ```bash
   docker compose -f docker-compose.prod.yml build migrate
   docker compose -f docker-compose.prod.yml run --rm migrate npx prisma migrate deploy
   ```
   Opcional — sembrar categorías/productos de ejemplo o crear el primer usuario admin a mano (mejor no reutilizar las contraseñas de ejemplo del seed de desarrollo en producción):
   ```bash
   docker compose -f docker-compose.prod.yml run --rm migrate npx prisma db seed
   ```

5. **Construir y levantar la app**, ya con el esquema listo:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

6. **nginx**: copiar `deploy/store.bskully.es.conf` a `/etc/nginx/sites-available/store.bskully.es` y enlazarlo:
   ```bash
   cp deploy/store.bskully.es.conf /etc/nginx/sites-available/store.bskully.es
   ln -s /etc/nginx/sites-available/store.bskully.es /etc/nginx/sites-enabled/
   nginx -t   # comprobar la config antes de recargar -- no reiniciar nginx a ciegas, afecta también a Cards y Survivors
   systemctl reload nginx
   ```

7. **Certificado**: el `.conf` reutiliza el certificado de `bskully.es`. Para ampliarlo y que cubra explícitamente `store.bskully.es` (recomendado, no urgente):
   ```bash
   certbot --nginx -d bskully.es -d www.bskully.es -d store.bskully.es --expand
   ```

8. **Verificar**: `https://store.bskully.es` debe responder. Revisar `docker compose -f docker-compose.prod.yml logs -f app` si algo falla.

## Despliegues siguientes

Si el cambio **no** toca `prisma/schema.prisma`:

```bash
cd skullystore-showcase
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

**Si el cambio SÍ incluye una migración, esta va ANTES de recrear `app`, nunca después.** El código nuevo (ya en el `git pull`) asume que la tabla/columna nueva existe; si `app` se recrea con ese código antes de que la migración se aplique, cualquier petición que toque esa parte del esquema da 500 hasta que se corra la migración -- pasó de verdad (~7h de `TableDoesNotExist` en producción por dejar la migración "para luego"). Orden correcto:

```bash
cd skullystore-showcase
git pull

# 1. Migración primero (usa el código ya actualizado del pull, pero el
#    contenedor "app" viejo todavía no la necesita, así que no pasa nada
#    por aplicarla antes de que "app" se entere).
docker compose -f docker-compose.prod.yml build migrate
docker compose -f docker-compose.prod.yml run --rm migrate npx prisma migrate deploy

# 2. Solo entonces recrear "app" con el código nuevo.
docker compose -f docker-compose.prod.yml up -d --build
```

No lanzar el build de `migrate` y el de `app` en paralelo (dos `docker build` de Next.js a la vez han disparado la carga de esta VPS a niveles que hicieron saltar el OOM killer, llegando a afectar a Cards) -- van en secuencia.

## Notas

- El contenedor de la app solo publica en `127.0.0.1:3001` — nginx es el único punto de entrada público, igual que con Cards y Survivors.
- `docker compose -f docker-compose.prod.yml logs -f app` / `... logs -f db` para depurar.
- No tocar los `docker-compose.yml` de Cards ni Survivors, ni su red `antitropic-net` — SkullyStore no depende de ellos.
- Migración de dominio raíz (`bskully.es` → store, juego de cartas → `cards.bskully.es`) es un paso posterior y deliberado, no parte de este primer despliegue.
