import type { AuthUser } from '../auth/types/authUser'
import { canAccessAdminRoute } from '../auth/utils/adminNavigation'
import { solicitudAusenciaDetailPath } from '../solicitudes-ausencia/solicitudesAusenciaPaths'
import { rutaAveriaNotificacion } from './rutaAveriaNotificacion'
import type { NotificacionAveriaItem } from './types'

/**
 * Destino al pulsar un ítem de la campana.
 * Solicitud de ausencia → cola RRHH admin; avería → rutas ya protegidas.
 */
export function rutaNotificacionCampana(
  user: AuthUser | null,
  item: Pick<NotificacionAveriaItem, 'idAveria' | 'idSolicitudAusencia'>,
): string | null {
  const idSolicitud = item.idSolicitudAusencia
  if (idSolicitud != null && Number.isInteger(idSolicitud) && idSolicitud > 0) {
    const path = solicitudAusenciaDetailPath(idSolicitud)
    return canAccessAdminRoute(user, path) ? path : null
  }

  const idAveria = item.idAveria
  if (idAveria != null && Number.isInteger(idAveria) && idAveria > 0) {
    return rutaAveriaNotificacion(user, idAveria)
  }

  return null
}
