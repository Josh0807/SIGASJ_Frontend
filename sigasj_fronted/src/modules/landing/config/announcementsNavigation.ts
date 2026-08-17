import { ANNOUNCEMENTS_HREF } from './landingAnchors'

/**
 * CTA “Ver más comunicados” (sección pública de la Landing).
 *
 * Estado actual de la arquitectura SIGASJ (revisión):
 * - Existe ancla de sección en Landing: {@link ANNOUNCEMENTS_HREF} (`#comunicados`).
 * - No existe ruta SPA pública de listado completo de comunicados.
 * - No existe paginación ni mecanismo de “cargar más” en el listado público.
 *
 * Pendiente: cuando el producto defina Opción A (ruta pública) u Opción C
 * (paginación), asignar aquí la ruta SPA pública o cablear la
 * carga de la siguiente página en el hook. No usar /login ni rutas admin.
 *
 * Mientras sea `null`, el botón no se muestra al visitante (no se inventa navegación).
 */
export const PUBLIC_ANNOUNCEMENTS_MORE_HREF: string | null = null

/** Texto fijo del CTA de listado ampliado. */
export const MORE_ANNOUNCEMENTS_LABEL = 'Ver más comunicados' as const

/** Reexport útil para consumidores que enlazan solo a la sección de la Landing. */
export { ANNOUNCEMENTS_HREF }
