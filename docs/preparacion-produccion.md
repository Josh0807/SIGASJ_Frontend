# Preparación de producción — frontend (PBI 11.1)

## Cómo se construye

- Carpeta de la app: `sigasj_fronted/`
- Node.js: `>=22.12.0 <23` (ver `.nvmrc`)
- Gestor: npm (`package-lock.json`)
- Instalación: `npm ci` (o `npm install`)
- Tipos + build: `npm run build` → `tsc -b && vite build`
- Salida: `sigasj_fronted/dist/`
- Vista local del artefacto: `npm run preview`

## Variables (todas `VITE_` son visibles en el navegador)

| Nombre | Obligatoria en prod | Uso |
|--------|---------------------|-----|
| `VITE_API_URL` | Sí | Base HTTP de la API, con `/api/v1` |
| `VITE_BACKEND_URL` | No | Origen de `/uploads`; si falta se deriva de `VITE_API_URL` |
| `VITE_JOTFORM_FORM_ID` | No | Embed público de Jotform; no es un secreto |

En desarrollo Vite ignora `VITE_API_URL` para las llamadas JSON: usa el proxy `/api` → `localhost:3000`.

## Hallazgos

- El build fallaba por `request` nulo en `SolicitudRevisionDetallePage.tsx`. Corregido.
- Un build de producción **sin** `VITE_API_URL` ya no cae en `localhost:3000`.
- El repositorio GitHub es `Josh0807/SIGASJ_Frontend`. Rama autorizada de integración: `main`. Root de Vercel: `sigasj_fronted`.
- `.env` está en `.gitignore`. No hay `.env` versionado. Copiar `.env.example`.

## Evidencia de esta pasada

Ejecutar en `sigasj_fronted/`: `node -v`, `npm run build`. El directorio `dist/` debe contener `index.html` y assets.
