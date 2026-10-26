import type { AuthUser } from '../auth/types/authUser'
import { canAccessAdminRoute } from '../auth/utils/adminNavigation'
import {
  misSolicitudAusenciaDetailPath,
  solicitudAusenciaDetailPath,
} from '../solicitudes-ausencia/solicitudesAusenciaPaths'
import {
  ALERTAS_REPOSICION_PATH,
  movimientoDetailPath,
  reposicionDetailPath,
  solicitudMaterialesDetailPath,
  solicitudRevisionDetailPath,
} from '../inventario/inventarioPaths'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividades-fontanero/actividadesFontaneroPaths'
import { ACTIVIDADES_ADMIN_PATHS } from '../actividades-fontanero/admin/actividadesAdminPaths'
import { rutaAveriaNotificacion } from './rutaAveriaNotificacion'
import type { NotificacionAveriaItem } from './types'

const esRolFontanero = (user: AuthUser | null) =>
  user?.role?.toLowerCase() === 'fontanero'

/**
 * Destino al pulsar un ítem de la campana.
 * Solicitud de ausencia → cola RRHH admin; avería → rutas ya protegidas.
 */
export function rutaNotificacionCampana(
  user: AuthUser | null,
  item: Partial<Pick<
    NotificacionAveriaItem,
    | 'idAveria'
    | 'idSolicitudAusencia'
    | 'idSolicitudMateriales'
    | 'idSalidaInventario'
    | 'idReposicion'
    | 'idActividad'
    | 'tipo'
  >>,
): string | null {
  const idSolicitudMateriales = item.idSolicitudMateriales
  if (
    idSolicitudMateriales != null &&
    Number.isInteger(idSolicitudMateriales) &&
    idSolicitudMateriales > 0
  ) {
    const esRespuestaParaFontanero =
      item.tipo === 'SOLICITUD_MATERIALES_APROBADA_FONTANERO' ||
      item.tipo === 'SOLICITUD_MATERIALES_RECHAZADA_FONTANERO'
    const path = esRespuestaParaFontanero
      ? solicitudMaterialesDetailPath(idSolicitudMateriales)
      : solicitudRevisionDetailPath(idSolicitudMateriales)
    return canAccessAdminRoute(user, path) ? path : null
  }

  const idReposicion = item.idReposicion
  if (idReposicion != null && Number.isInteger(idReposicion) && idReposicion > 0) {
    const detailPath = reposicionDetailPath(idReposicion)
    if (canAccessAdminRoute(user, detailPath)) return detailPath
    return canAccessAdminRoute(user, ALERTAS_REPOSICION_PATH)
      ? ALERTAS_REPOSICION_PATH
      : null
  }

  const idSalidaInventario = item.idSalidaInventario
  if (
    idSalidaInventario != null &&
    Number.isInteger(idSalidaInventario) &&
    idSalidaInventario > 0
  ) {
    const path = movimientoDetailPath(idSalidaInventario)
    return canAccessAdminRoute(user, path) ? path : null
  }

  const idActividad = item.idActividad
  if (idActividad != null && Number.isInteger(idActividad) && idActividad > 0) {
    const path = esRolFontanero(user)
      ? ACTIVIDADES_FONTANERO_PATHS.corregirActividad(idActividad)
      : ACTIVIDADES_ADMIN_PATHS.revision
    return canAccessAdminRoute(user, path) ? path : null
  }

  const idSolicitud = item.idSolicitudAusencia
  if (idSolicitud != null && Number.isInteger(idSolicitud) && idSolicitud > 0) {
    const esRespuestaFontanero =
      esRolFontanero(user) ||
      item.tipo === 'SOLICITUD_AUSENCIA_APROBADA_FONTANERO' ||
      item.tipo === 'SOLICITUD_AUSENCIA_RECHAZADA_FONTANERO'
    const path = esRespuestaFontanero
      ? misSolicitudAusenciaDetailPath(idSolicitud)
      : solicitudAusenciaDetailPath(idSolicitud)
    return canAccessAdminRoute(user, path) ? path : null
  }

  const idAveria = item.idAveria
  if (idAveria != null && Number.isInteger(idAveria) && idAveria > 0) {
    return rutaAveriaNotificacion(user, idAveria)
  }

  return null
}
