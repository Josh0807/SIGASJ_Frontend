import { ADMIN_BASE_PATH } from '../../../app/router/adminPaths'
import type { AuthUser } from '../types/authUser'
import { isAbonadoRole } from './internalRoles'

/** Única ruta real de Gestión de Abonados: padrón administrativo. */
export const ADMINISTRATIVE_ABONADOS_PATH = `${ADMIN_BASE_PATH}/abonados`

export const normalizeAbonadoPath = (path: string): string =>
  path.replace(/\/+$/, '') || '/'

/**
 * Listado, alta, edición y detalle administrativos viven bajo esta ruta.
 * Cualquier sufijo (`/11`, `/nuevo`) se trata como la misma función administrativa.
 * No hay ruta parametrizada `:id` que consulte otro abonado.
 */
export function isAdministrativeAbonadosPath(path: string): boolean {
  const normalized = normalizeAbonadoPath(path)
  return (
    normalized === ADMINISTRATIVE_ABONADOS_PATH ||
    normalized.startsWith(`${ADMINISTRATIVE_ABONADOS_PATH}/`)
  )
}

export type AbonadoPersonalNavItem = {
  path: string
  title: string
}

/**
 * Funciones personales de Abonado que ya existen como pantalla autenticada.
 * Hoy no hay “Mis datos”, “Mi perfil” de padrón ni “Solicitar cambio de datos”.
 * `/admin/perfil` es cuenta del personal interno; el Abonado no entra al panel.
 * No se inventan rutas ni ítems de menú.
 */
export const ABONADO_PERSONAL_NAV_ITEMS: readonly AbonadoPersonalNavItem[] = []

export const ABONADO_PERSONAL_ROUTE_PATHS: readonly string[] =
  ABONADO_PERSONAL_NAV_ITEMS.map((item) => item.path)

export function isListedAbonadoPersonalRoute(
  path: string,
  personalPaths: readonly string[] = ABONADO_PERSONAL_ROUTE_PATHS,
): boolean {
  const normalized = normalizeAbonadoPath(path)
  return personalPaths.some((item) => normalizeAbonadoPath(item) === normalized)
}

export function isAbonadoPersonalRoute(path: string): boolean {
  return isListedAbonadoPersonalRoute(path)
}

/** El Abonado no usa Gestión de Abonados administrativa ni IDs en la URL. */
export function canAbonadoAccessRoute(
  path: string,
  personalPaths: readonly string[] = ABONADO_PERSONAL_ROUTE_PATHS,
): boolean {
  if (isAdministrativeAbonadosPath(path)) {
    return false
  }

  return isListedAbonadoPersonalRoute(path, personalPaths)
}

/** Ruta lista para el router: sin barra inicial, relativa al ProtectedRoute raíz. */
export function toAbonadoPersonalRoutePath(path: string): string {
  return normalizeAbonadoPath(path).replace(/^\//, '')
}

export function getAbonadoPersonalNavItems(
  user: AuthUser | null,
): readonly AbonadoPersonalNavItem[] {
  if (!isAbonadoRole(user?.role)) {
    return []
  }

  return ABONADO_PERSONAL_NAV_ITEMS
}
