import { averiasAdminDetailPath } from '../admin/averiasAdminPaths'
import { averiasFontaneroDetailPath } from '../fontanero/averiasFontaneroPaths'
import {
  SALIDAS_PATH,
  SOLICITUD_MATERIALES_NEW_PATH,
  SOLICITUDES_REVISION_PATH,
  solicitudMaterialesDetailPath,
  solicitudRevisionDetailPath,
} from '../../inventario/inventarioPaths'

const FONTANERO_AVERIA_RETURN = /^\/fontanero\/averias\/\d+$/
const ADMIN_AVERIA_RETURN = /^\/admin\/averias\/\d+$/

export function normalizeAveriaReturnPath(path: string): string {
  return path.split('?')[0]?.replace(/\/+$/, '') || '/'
}

export function isSafeAveriaReturnPath(
  path: string | null | undefined,
): path is string {
  if (!path) {
    return false
  }
  if (!path.startsWith('/') || path.startsWith('//')) {
    return false
  }
  const normalized = normalizeAveriaReturnPath(path)
  return (
    FONTANERO_AVERIA_RETURN.test(normalized) ||
    ADMIN_AVERIA_RETURN.test(normalized)
  )
}

export function readSafeAveriaReturnPath(
  value: string | null | undefined,
): string | null {
  return isSafeAveriaReturnPath(value) ? normalizeAveriaReturnPath(value) : null
}

export function solicitudMaterialesDesdeAveriaHref(
  idAveria: number,
  codigoSeguimiento: string,
  from: string,
): string {
  const params = new URLSearchParams({
    idAveria: String(idAveria),
    referencia: codigoSeguimiento,
    from,
  })
  return `${SOLICITUD_MATERIALES_NEW_PATH}?${params.toString()}`
}

export function salidaDesdeAveriaHref(idAveria: number, from: string): string {
  const params = new URLSearchParams({
    idAveria: String(idAveria),
    from,
  })
  return `${SALIDAS_PATH}?${params.toString()}`
}

export function solicitudFontaneroDetalleHref(id: number): string {
  return solicitudMaterialesDetailPath(id)
}

export function solicitudAdminRevisionHref(id: number): string {
  return solicitudRevisionDetailPath(id)
}

export function solicitudesAdminRevisionHref(): string {
  return SOLICITUDES_REVISION_PATH
}

export function fontaneroAveriaReturnPath(idAveria: number): string {
  return averiasFontaneroDetailPath(idAveria)
}

export function adminAveriaReturnPath(idAveria: number): string {
  return averiasAdminDetailPath(idAveria)
}
