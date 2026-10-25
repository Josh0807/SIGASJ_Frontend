import { labelEstadoSolicitud } from './admin/solicitudEstadoUi'
import type {
  EventoSeguimientoPublico,
  SeguimientoSolicitudPublico,
} from './seguimientoPublicoTypes'
import type { SolicitudEstado } from './types'

export type RolVisualEvento = 'completado' | 'actual' | 'pasado'

/** Orden ASC por fecha (copia). Desempate estable por índice original. */
export const ordenarEventosPublicos = (
  eventos: readonly EventoSeguimientoPublico[],
): EventoSeguimientoPublico[] =>
  [...eventos]
    .map((evento, indice) => ({ evento, indice }))
    .sort((a, b) => {
      const ta = new Date(a.evento.fecha).getTime()
      const tb = new Date(b.evento.fecha).getTime()
      if (ta !== tb) return ta - tb
      return a.indice - b.indice
    })
    .map(({ evento }) => evento)

export const tituloEventoPublico = (evento: EventoSeguimientoPublico): string => {
  if (evento.estadoAnterior == null) {
    return `Solicitud registrada · ${labelEstadoSolicitud(evento.estadoNuevo)}`
  }
  if (evento.estadoAnterior === evento.estadoNuevo) {
    return labelEstadoSolicitud(evento.estadoNuevo)
  }
  return `${labelEstadoSolicitud(evento.estadoAnterior)} → ${labelEstadoSolicitud(evento.estadoNuevo)}`
}

/**
 * Rol visual sobre historial real (no workflow inventado).
 * El último evento cuyo estadoNuevo coincide con estadoActual es "actual";
 * los anteriores son "completado". Si ninguno coincide, el último es "pasado"
 * y el estadoActual sigue mostrándose solo en el resumen.
 */
export const rolVisualEventoPublico = (
  eventosOrdenados: readonly EventoSeguimientoPublico[],
  index: number,
  estadoActual: SolicitudEstado,
): RolVisualEvento => {
  const indicesCoincidentes = eventosOrdenados
    .map((e, i) => (e.estadoNuevo === estadoActual ? i : -1))
    .filter((i) => i >= 0)
  const indiceActual =
    indicesCoincidentes.length > 0
      ? indicesCoincidentes[indicesCoincidentes.length - 1]
      : -1

  if (indiceActual >= 0) {
    if (index === indiceActual) return 'actual'
    if (index < indiceActual) return 'completado'
    return 'pasado'
  }

  if (index < eventosOrdenados.length - 1) return 'completado'
  return 'pasado'
}

export const esEstadoTerminalPublico = (estado: SolicitudEstado): boolean =>
  estado === 'APROBADA' ||
  estado === 'RECHAZADA' ||
  estado === 'FINALIZADA' ||
  estado === 'CANCELADA'

export const esEstadoEspecialNegativo = (estado: SolicitudEstado): boolean =>
  estado === 'RECHAZADA' || estado === 'CANCELADA'

/**
 * Toma solo campos del contrato público (defensa si Backend envía extras).
 * No incluye notaInterna, usuario, documentos, firma ni identificación.
 */
export const sanitizarSeguimientoPublico = (
  raw: SeguimientoSolicitudPublico,
): SeguimientoSolicitudPublico => ({
  codigoSeguimiento: raw.codigoSeguimiento,
  estado: raw.estado,
  fechaIngreso: raw.fechaIngreso,
  tipoSolicitud: raw.tipoSolicitud
    ? {
        nombre: raw.tipoSolicitud.nombre,
        slug: raw.tipoSolicitud.slug,
      }
    : null,
  historial: (raw.historial ?? []).map((evento) => ({
    fecha: evento.fecha,
    estadoAnterior: evento.estadoAnterior,
    estadoNuevo: evento.estadoNuevo,
    observacionPublica: evento.observacionPublica ?? null,
  })),
})

/** Detecta claves sensibles en el payload (solo para QA/tests). */
export const clavesPrivadasEnPayload = (raw: unknown): string[] => {
  const texto = JSON.stringify(raw ?? {})
  const sospechosas = [
    'notaInterna',
    'idUsuario',
    'usuarioId',
    'password',
    'firma',
    'storageKey',
    'rutaReferenciaArchivo',
  ]
  return sospechosas.filter((clave) =>
    new RegExp(`"${clave}"\\s*:`, 'i').test(texto),
  )
}
