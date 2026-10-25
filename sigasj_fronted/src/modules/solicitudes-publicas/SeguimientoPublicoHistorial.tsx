import { IconCircleCheck, IconCircleDot, IconCircle } from '@tabler/icons-react'
import { formatearFechaHoraAsada } from '../../shared/utils/fechaAsada'
import type { EventoSeguimientoPublico } from './seguimientoPublicoTypes'
import type { SolicitudEstado } from './types'
import {
  ordenarEventosPublicos,
  rolVisualEventoPublico,
  tituloEventoPublico,
  type RolVisualEvento,
} from './seguimientoPublicoTimelineUtils'

type Props = {
  eventos: readonly EventoSeguimientoPublico[]
  estadoActual: SolicitudEstado
}

const etiquetaRol = (rol: RolVisualEvento): string => {
  switch (rol) {
    case 'completado':
      return 'Completado'
    case 'actual':
      return 'Actual'
    default:
      return 'Registrado'
  }
}

const IconoRol = ({ rol }: { rol: RolVisualEvento }) => {
  if (rol === 'completado') {
    return (
      <IconCircleCheck
        className="text-emerald-600"
        size={18}
        aria-hidden="true"
      />
    )
  }
  if (rol === 'actual') {
    return (
      <IconCircleDot className="text-[#0b6bcb]" size={18} aria-hidden="true" />
    )
  }
  return <IconCircle className="text-slate-400" size={18} aria-hidden="true" />
}

const clasePunto = (rol: RolVisualEvento): string => {
  if (rol === 'completado') {
    return 'border-emerald-200 bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]'
  }
  if (rol === 'actual') {
    return 'border-white bg-[#0b6bcb] shadow-[0_0_0_3px_rgba(11,107,203,0.2)]'
  }
  return 'border-slate-200 bg-slate-300 shadow-[0_0_0_3px_rgba(148,163,184,0.2)]'
}

/**
 * Timeline pública basada en historial real (ASC).
 * No inventa etapas futuras ni usa notaInterna/usuario.
 */
export default function SeguimientoPublicoHistorial({
  eventos,
  estadoActual,
}: Props) {
  const ordenados = ordenarEventosPublicos(eventos)

  if (ordenados.length === 0) {
    return (
      <p className="mb-0 mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-600">
        No hay actualizaciones adicionales para mostrar. El estado actual de la
        solicitud aparece arriba.
      </p>
    )
  }

  return (
    <ol className="relative m-0 mt-5 list-none space-y-0 p-0 before:absolute before:top-2 before:bottom-2 before:left-[0.7rem] before:w-px before:bg-sky-100 max-[640px]:before:left-[0.65rem]">
      {ordenados.map((evento, index) => {
        const rol = rolVisualEventoPublico(ordenados, index, estadoActual)
        return (
          <li
            key={`${evento.fecha}-${evento.estadoNuevo}-${index}`}
            className="relative grid grid-cols-[1.6rem_minmax(0,1fr)] gap-x-3 pb-5 last:pb-0"
          >
            <span
              className={`relative z-10 mt-1.5 size-2.5 justify-self-center rounded-full border-2 ${clasePunto(rol)}`}
              aria-hidden="true"
            />
            <article className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 max-[640px]:p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-600">
                  <IconoRol rol={rol} />
                  {etiquetaRol(rol)}
                </span>
                <time
                  className="text-sm font-extrabold text-[#062e63]"
                  dateTime={evento.fecha}
                >
                  {formatearFechaHoraAsada(evento.fecha)}
                </time>
              </div>
              <p className="mb-0 mt-2 text-base font-extrabold leading-snug text-[#073b79]">
                {tituloEventoPublico(evento)}
              </p>
              {evento.observacionPublica ? (
                <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2">
                  <p className="m-0 text-xs font-extrabold uppercase tracking-wide text-sky-800">
                    Observación
                  </p>
                  <p className="mb-0 mt-1 break-words text-sm leading-6 text-slate-800">
                    {evento.observacionPublica}
                  </p>
                </div>
              ) : null}
            </article>
          </li>
        )
      })}
    </ol>
  )
}
