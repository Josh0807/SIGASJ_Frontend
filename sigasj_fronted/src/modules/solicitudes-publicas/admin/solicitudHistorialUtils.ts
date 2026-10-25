import { labelEstadoSolicitud } from './solicitudEstadoUi'
import type { HistorialSolicitudEvento } from './solicitudesAdminTypes'

export const fechaEventoHistorial = (evento: HistorialSolicitudEvento): string =>
  evento.fechaHora ?? evento.fecha ?? ''

/** Orden cronológico estable: fecha ASC, desempate por id ASC. No muta el arreglo original. */
export const ordenarHistorialCronologico = (
  eventos: readonly HistorialSolicitudEvento[],
): HistorialSolicitudEvento[] =>
  [...eventos].sort((a, b) => {
    const ta = new Date(fechaEventoHistorial(a)).getTime()
    const tb = new Date(fechaEventoHistorial(b)).getTime()
    if (ta !== tb) return ta - tb
    return a.id - b.id
  })

export const tituloTransicionHistorial = (evento: HistorialSolicitudEvento): string => {
  if (evento.estadoAnterior == null) {
    return `Solicitud registrada · ${labelEstadoSolicitud(evento.estadoNuevo)}`
  }
  if (evento.estadoAnterior === evento.estadoNuevo) {
    return labelEstadoSolicitud(evento.estadoNuevo)
  }
  return `${labelEstadoSolicitud(evento.estadoAnterior)} → ${labelEstadoSolicitud(evento.estadoNuevo)}`
}

export const formatearFechaHistorial = (valor: string): { fecha: string; hora: string } => {
  const d = new Date(valor)
  if (Number.isNaN(d.getTime())) {
    return { fecha: valor, hora: '' }
  }
  return {
    fecha: d.toLocaleDateString('es-CR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    hora: d.toLocaleTimeString('es-CR', {
      hour: 'numeric',
      minute: '2-digit',
    }),
  }
}

/** Nombre (+ rol) del responsable. Sin usuario: omitir (no inventar "Sistema" ni IDs técnicos). */
export const nombreResponsableHistorial = (
  evento: HistorialSolicitudEvento,
): string | null => {
  if (!evento.usuario?.nombre?.trim()) return null
  const nombre = evento.usuario.nombre.trim()
  const rol = evento.usuario.rol?.trim()
  return rol ? `${nombre} · ${rol}` : nombre
}
