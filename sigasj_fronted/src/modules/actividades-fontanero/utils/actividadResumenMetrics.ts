import type { ResumenActividadesResponse } from '../types/actividadResumen'

const countEstados = (
  porEstado: Record<string, number>,
  estados: readonly string[],
): number =>
  estados.reduce((sum, estado) => sum + (porEstado[estado] ?? 0), 0)

export type ActividadResumenMetricas = {
  total: number
  pendientesRevision: number
  revisadas: number
  correccionSolicitada: number
  corregidas: number
}

export const buildFontaneroResumenMetricas = (
  resumen: ResumenActividadesResponse,
): ActividadResumenMetricas => {
  const { porEstado, total } = resumen

  return {
    total,
    pendientesRevision: countEstados(porEstado, ['REPORTADA', 'EN_REVISION']),
    revisadas: countEstados(porEstado, [
      'REVISADA',
      'APROBADA',
      'RECHAZADA',
      'CORREGIDA',
    ]),
    correccionSolicitada: porEstado.REQUIERE_CORRECCION ?? 0,
    corregidas: porEstado.CORREGIDA ?? 0,
  }
}

export const buildAdminResumenMetricas = (
  resumen: ResumenActividadesResponse,
): ActividadResumenMetricas => {
  const { porEstado, total } = resumen

  return {
    total,
    pendientesRevision: countEstados(porEstado, ['REPORTADA', 'EN_REVISION']),
    revisadas: porEstado.REVISADA ?? 0,
    correccionSolicitada: porEstado.REQUIERE_CORRECCION ?? 0,
    corregidas: porEstado.CORREGIDA ?? 0,
  }
}
