# SIGASJ Design System (ASADA)

## Principios

- **Una paleta:** ASADA (`asada-tokens.css` + Tailwind `@theme`).
- **Operate first** en admin/inventario: claridad > decoración.
- **Sin Preflight Tailwind** mientras exista `index.css` legacy.
- **No romper lógica** de roles, stock ni rutas al rediseñar.

## Tokens

Fuente canónica de color: `--asada-*` / `--color-asada-*` / alias `--color-sigasj-*` (ya alineados al azul institucional).

| Token | Uso |
|---|---|
| navy / ink | Acciones primarias, títulos |
| ice / mist | Fondos suaves, empty states |
| success / warning / danger | Badges y alertas |
| Manrope | Display / títulos |
| Inter | Cuerpo |

## Primitives (`src/shared/ui`)

Usar estos componentes en UI nueva o al migrar pantallas:

- `Button` — primary / secondary / tertiary / danger / ghost
- `Badge` — estados
- `Alert` — feedback inline
- `Card` — contenedores
- `PageHeader` — cabeceras de módulo
- `EmptyState` — listas vacías
- `MetricPill` — métricas compactas (cantidad, totales)
- `cn` + `buttonVariants` (CVA) — variantes tipadas

Inventario puede seguir usando clases `inv-*` como capa scoped; al tocar pantallas, preferir `shared/ui` + `inv-*` existentes en lugar de nuevos BEM en `index.css`.

## Motion

- Transiciones cortas (150–250ms).
- Respetar `prefers-reduced-motion`.
- No expandir AOS al panel admin.

## Librerías adoptadas (fase actual)

- `clsx` + `tailwind-merge` + `class-variance-authority` → variantes tipadas
- `@radix-ui/react-dialog` → `shared/ui/Dialog` (nuevo). `ConfirmDialog` legacy se mantiene por tests/a11y existentes.
- `@playwright/test` → smoke visual (`npm run test:e2e`)

## Qué evitar

- Nuevos `!important` en `index.css`.
- Gradientes Tailwind `from-blue-*` dentro de `.inventory-bodega` (los overrides los pintan navy).
- Segunda paleta teal.
- Dump completo de shadcn / Storybook / Recharts / TanStack sin necesidad.
