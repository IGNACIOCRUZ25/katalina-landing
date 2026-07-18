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

## ¿Cómo editamos después de publicar?

- **Texto/precio simple:** lo editas en GitHub (web) o me lo pides.
- **Diseño/secciones:** lo hago yo.
- Cada cambio guardado en GitHub se **publica solo** en `katalinasalon.cl` en ~30 segundos.
- Siempre hay copia de seguridad y se puede revertir.

---

*Preparado por Claude · 18 jul 2026*
