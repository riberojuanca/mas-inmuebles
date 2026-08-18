# Casa en venta — landing

Landing de una sola página para usar como destino de Google Ads: grilla de fotos con visor a pantalla completa, círculo con logo que abre el video (reel) en formato historia, y CTA a WhatsApp.

## 1. Poner tus archivos

- Fotos → `src/assets/images/` (jpg/jpeg/png/webp). Se detectan solas y aparecen todas en la grilla, ordenadas por nombre de archivo — no hace falta tocar `config.ts`.
- Logo (para el círculo) → `public/logo/logo.png`
- Reel/video → `public/video/reel.mp4`

## 2. Editar `src/config.ts`

- `whatsappNumber`: tu número en formato internacional sin `+` ni espacios (ej. `59891234567`).
- `whatsappMessage`: mensaje precargado.
- `googleAdsConversionId`: dejalo vacío hasta crear la conversión en Google Ads (Herramientas → Conversiones → "Clic en WhatsApp"). Ahí también hay que descomentar el snippet de `gtag.js` en `index.html`.

## 3. Correr en local

```bash
npm install
npm run dev
```

## 4. Publicar en GitHub Pages

1. Creá un repo en GitHub y subí este proyecto (rama `main`).
2. En el repo: **Settings → Pages → Source → GitHub Actions** (el workflow ya está en `.github/workflows/deploy.yml`, se dispara solo con cada push a `main`).
3. Dominio propio: **Settings → Pages → Custom domain**, poné tu dominio. GitHub crea un `CNAME` en el repo automáticamente. En tu proveedor de DNS agregá:
   - Si es dominio raíz (`micasa.com`): registros `A` apuntando a las IPs de GitHub Pages (185.199.108.153, .109.153, .110.153, .111.153).
   - Si es subdominio (`www.micasa.com` o `venta.micasa.com`): registro `CNAME` apuntando a `TUUSUARIO.github.io`.
4. Si en cambio publicás en `TUUSUARIO.github.io/mas-inmuebles` (sin dominio propio), cambiá `base: "/"` por `base: "/mas-inmuebles/"` en `vite.config.ts`.

## Medición

El botón de WhatsApp abre `wa.me` en pestaña nueva y, si configuraste `googleAdsConversionId`, dispara el evento de conversión de Google Ads antes de redirigir.
