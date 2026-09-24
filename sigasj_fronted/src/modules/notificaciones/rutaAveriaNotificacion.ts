import type { AuthUser } from '../auth/types/authUser'
import { canAccessAdminRoute } from '../auth/utils/adminNavigation'
import { averiasAdminDetailPath } from '../averias/admin/averiasAdminPaths'
import { averiasFontaneroDetailPath } from '../averias/fontanero/averiasFontaneroPaths'

/**
 * Usa las rutas ya protegidas de Averías. No inventa un atajo
 * que eluda los guards de Administradora/Secretaria/Fontanero.
 */
export function rutaAveriaNotificacion(
  user: AuthUser | null,
  idAveria: number,
): string | null {
  if (!Number.isInteger(idAveria) || idAveria <= 0) {
    return null
  }

  const adminPath = averiasAdminDetailPath(idAveria)
  if (canAccessAdminRoute(user, adminPath)) {
    return adminPath
  }

  const fontaneroPath = averiasFontaneroDetailPath(idAveria)
  if (canAccessAdminRoute(user, fontaneroPath)) {
    return fontaneroPath
  }

  return null
}
