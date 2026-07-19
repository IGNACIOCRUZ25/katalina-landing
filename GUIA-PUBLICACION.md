# Guía de publicación — Katalina Beauty Salon Academy

Sitio estático listo para publicar en `katalinasalon.cl`.

Esta guía cubre **las tareas que debes hacer tú** (crear cuentas y registrar el dominio). La parte de código ya está lista.

---

## Estado actual del proyecto

✅ Landing optimizada (`index.html`)
✅ SEO: título, meta, Open Graph (vista previa al compartir), datos estructurados Schema.org
✅ Favicon e íconos (`favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`)
✅ Imagen de previsualización (`assets/og-image.jpg`)
✅ `robots.txt` y `sitemap.xml`
✅ `vercel.json` (configuración de hosting: seguridad + caché)
✅ Contador de oferta que ya no se reinicia
✅ Línea de confianza y "hasta 67% OFF"

---

## Paso 1 — Registrar el dominio (NIC Chile)

1. Entra a **https://nic.cl**
2. Busca **katalinasalon.cl** (confirmado disponible al 18-jul-2026).
3. Regístralo (necesitas RUT y tarjeta). Costo ~$10.000 CLP/año.
4. Guarda el usuario y clave de NIC Chile: los necesitaremos para apuntar el dominio.

## Paso 2 — Crear cuenta en GitHub (gratis)

1. Entra a **https://github.com** → **Sign up**.
2. Crea un repositorio nuevo (privado), por ejemplo `katalina-landing`.
3. Avísame cuando esté creado: subo el proyecto ahí (o te guío para arrastrar la carpeta).

## Paso 3 — Publicar en Vercel (gratis) y conectar

1. Entra a **https://vercel.com** → **Sign up** → entra con tu cuenta de GitHub.
2. **Add New… → Project → Import** el repo `katalina-landing`.
3. Framework Preset: **Other**. Sin build command, output dir por defecto (raíz). Presiona **Deploy**.
4. En segundos tendrás una URL tipo `katalina-landing.vercel.app` (ya en vivo, con https).

> El archivo `vercel.json` ya incluye la configuración óptima (cabeceras de seguridad y caché de imágenes). No hay que tocar nada.

## Paso 4 — Conectar el dominio

1. En Vercel: **Settings → Domains → Add** → escribe `katalinasalon.cl` (y también `www.katalinasalon.cl`).
2. Vercel te dará unos **registros DNS** (un registro A y/o nameservers).
3. En NIC Chile, en la administración del dominio, pega esos datos.
4. Espera la propagación (de minutos a unas horas). El **SSL (candado https) se activa solo**.
5. Vercel redirige `www` al dominio raíz automáticamente al añadir ambos.

## Paso 5 — Pago automático (Mercado Pago)

1. Crea cuenta en **https://www.mercadopago.cl** (empresa/emprendedor).
2. Genera un **link de pago** por curso (o me pides integrar el checkout).
3. Me pasas los links y los conecto a cada botón "Inscribirme".

## Paso 6 — Analítica y buscadores

1. **Google Analytics 4** (analytics.google.com) → me pasas el ID de medición (`G-XXXX`).
2. **Meta Pixel** (business.facebook.com) si vas a hacer publicidad en Instagram → me pasas el ID.
3. **Google Search Console** (search.google.com/search-console) → verificas el dominio y subes el sitemap.

---

## Pago automático + entrega segura (variables de entorno en Vercel)

El pago y la entrega automática ya están programados. Para activarlos, agrega estas variables en
**Vercel → proyecto → Settings → Environment Variables** (marca *Production*) y relanza el despliegue:

| Variable | Qué es | Dónde se obtiene |
|---|---|---|
| `MP_ACCESS_TOKEN` | Clave secreta de Mercado Pago (producción, `APP_USR-…`) | mercadopago.cl/developers/panel → Credenciales de producción |
| `RESEND_API_KEY` | Clave para enviar correos automáticos | resend.com → API Keys |
| `EMAIL_FROM` | Remitente de los correos | Ej: `Katalina Beauty Salon <hola@katalinasalon.cl>` (dominio verificado en Resend) |
| `EMAIL_NOTIF` | Correo donde llegan los avisos de venta | El correo de Katalina |
| `MP_WEBHOOK_SECRET` | **Clave para validar que los avisos vengan de Mercado Pago** (anti-fraude) | mercadopago.cl/developers/panel → tu app → Webhooks → "Clave secreta" |

Opcionales: `SKEDU_URL` (por defecto tu Skedu), `WHATSAPP` (por defecto +56 9 3714 2655).

**Anti-entrega-duplicada (recomendado):** conecta un **Vercel KV** al proyecto (Vercel → Storage → Create → KV → Connect). Al conectarlo, Vercel agrega solas las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`, y el sistema deja de poder entregar dos veces el mismo pago aunque Mercado Pago reenvíe el aviso. Sin KV igual funciona, pero la protección es sólo "best-effort".

**Enlaces de los cursos:** los enlaces de Drive de cada curso van en `api/_cursos.js` (campo `drive`).
Envíame los enlaces y los dejo cargados.

**Seguridad anti-fraude:** la entrega NO se dispara desde la pantalla de "gracias". Se dispara desde
`api/webhook-mercadopago.js`, que le pregunta a Mercado Pago si el pago está realmente aprobado antes de
entregar. El aviso de Mercado Pago se configura solo (via `notification_url`), no hay que tocar el panel.

---

## ¿Cómo editamos después de publicar?

- **Texto/precio simple:** lo editas en GitHub (web) o me lo pides.
- **Diseño/secciones:** lo hago yo.
- Cada cambio guardado en GitHub se **publica solo** en `katalinasalon.cl` en ~30 segundos.
- Siempre hay copia de seguridad y se puede revertir.

---

*Preparado por Claude · 18 jul 2026*
