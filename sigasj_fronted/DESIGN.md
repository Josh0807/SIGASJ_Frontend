# SIGASJ Design System (ASADA)

## Principios

- **Una paleta:** ASADA (`asada-tokens.css` + Tailwind `@theme`).
- **Admin = mismo lenguaje visual que el landing** (tipografía, radios, cards, botones, copy), adaptado a trabajo operativo.
- **Sin Preflight Tailwind** mientras exista `index.css` legacy.
- **No romper lógica** de roles, stock ni rutas al rediseñar.

## Tokens

Fuente canónica de color: `--asada-*` / `--color-asada-*` / alias `--color-sigasj-*`.

| Token | Uso |
|---|---|
| navy / ink | Acciones primarias, títulos |
| ice / mist | Fondos suaves, empty states |
| success / warning / danger | Badges y alertas |
| Times New Roman (display) | Títulos de sección / PageHeader en admin y landing |
| Figtree (body) | Cuerpo y controles en admin y landing |
| Radios landing | card 13px, button 10px, input 9px |

## Primitives (`src/shared/ui`)

- `Button` — primary / secondary / tertiary / danger / ghost (+ lift landing)
- `Badge` — estados
- `Alert` — feedback inline
- `Card` — contenedores (radio 13px, lift opcional)
- `PageHeader` — cabeceras (eyebrow / título display / intro)
- `EmptyState` — listas vacías
- `MetricPill` — métricas compactas
- `AdminShell` — contenedor de página + entrada GSAP
- `AdminFilters` / `AdminListItem`
- `cn` + `buttonVariants` (CVA)

Inventario: `inv-*` alineado a los mismos tokens/`PageHeader`/`Button`.

## Motion

- **Landing:** AOS + CSS lift (`landing-lift-*`).
- **Admin:** GSAP (`@gsap/react`) para entrada de página y stagger de listados; CSS lift en cards/botones.
- Respetar `prefers-reduced-motion`.
- **No AOS** en el panel admin.

## Librerías

- `clsx` + `tailwind-merge` + `class-variance-authority`
- `@radix-ui/react-dialog` → `shared/ui/Dialog`
- `gsap` + `@gsap/react` → motion admin
- `@playwright/test` → smoke visual

## Checklist visual admin (por módulo)

- [ ] Cabecera con `PageHeader` (look SectionHeader / landing)
- [ ] Acciones con `Button` (+ lift)
- [ ] Contenedores con `Card` / `AdminFilters` / `AdminListItem`
- [ ] Estados con `Alert` + `EmptyState` y `adminCopy.ts`
- [ ] Contenedor: `AdminShell` (entrada GSAP)
- [ ] Sin hex/teal/gradientes fuera de tokens ASADA
- [ ] Tipografía Figtree/Times y radios 13/10 como landing

## Qué evitar

- Nuevos `!important` en `index.css`.
- Gradientes `from-blue-*` dentro de `.inventory-bodega`.
- Segunda paleta teal.
- AOS en `/admin/*`.
- Dump completo de shadcn / Storybook / Recharts / TanStack sin necesidad.
