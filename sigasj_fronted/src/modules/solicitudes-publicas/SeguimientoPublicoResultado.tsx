import { IconHome, IconRefresh } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { formatearFechaHoraAsada } from '../../shared/utils/fechaAsada'
import {
  claseBadgeEstadoSolicitud,
  labelEstadoSolicitud,
} from './admin/solicitudEstadoUi'
import SeguimientoPublicoHistorial from './SeguimientoPublicoHistorial'
import type { SeguimientoSolicitudPublico } from './seguimientoPublicoTypes'
import {
  esEstadoEspecialNegativo,
  esEstadoTerminalPublico,
  sanitizarSeguimientoPublico,
} from './seguimientoPublicoTimelineUtils'

type Props = {
  resultado: SeguimientoSolicitudPublico
  onNuevaConsulta?: () => void
}

/**
 * Vista pública de avance (4.14.2 / timeline).
 * Solo contrato público: código, tipo, fecha, estado, historial con observacionPublica.
 */
export default function SeguimientoPublicoResultado({
  resultado,
  onNuevaConsulta,
}: Props) {
  const data = sanitizarSeguimientoPublico(resultado)
  const terminal = esEstadoTerminalPublico(data.estado)
  const negativo = esEstadoEspecialNegativo(data.estado)

  return (
    <article
      className="mt-7 rounded-2xl border border-sky-200 bg-sky-50/70 p-6 max-[640px]:p-4"
      aria-live="polite"
      aria-labelledby="seguimiento-resultado-title"
    >
      <header className="grid gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="m-0 text-xs font-extrabold uppercase tracking-[0.12em] text-[#1476cf]">
              Resultado de la consulta
            </p>
            <h2
              id="seguimiento-resultado-title"
              className="m-0 mt-2 break-words text-[clamp(1.35rem,3vw,1.75rem)] font-black tracking-[-0.03em] text-[#062e63]"
            >
              {data.codigoSeguimiento}
            </h2>
            <p className="mb-0 mt-2 break-words text-base font-semibold text-[#173f6e]">
              {data.tipoSolicitud?.nombre ?? 'Solicitud'}
            </p>
          </div>
          <div className="grid gap-2 text-right max-[640px]:w-full max-[640px]:text-left">
            <p className="m-0 text-sm font-bold text-[#607a98]">Estado actual</p>
            <span
              className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-extrabold ${claseBadgeEstadoSolicitud(data.estado)}`}
            >
              {labelEstadoSolicitud(data.estado)}
            </span>
            {terminal ? (
              <p
                className={`m-0 text-xs font-bold ${negativo ? 'text-rose-700' : 'text-emerald-700'}`}
              >
                {negativo
                  ? 'Estado terminal · proceso cerrado'
                  : 'Estado terminal · trámite concluido'}
              </p>
            ) : null}
          </div>
        </div>

        <dl className="grid gap-4 rounded-2xl border border-white/80 bg-white/80 p-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-bold text-[#607a98]">
              Código de seguimiento
            </dt>
            <dd className="m-0 mt-1 break-words font-extrabold text-[#173f6e]">
              {data.codigoSeguimiento}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-bold text-[#607a98]">Tipo de trámite</dt>
            <dd className="m-0 mt-1 break-words font-semibold text-[#173f6e]">
              {data.tipoSolicitud?.nombre ?? '—'}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-bold text-[#607a98]">
              Fecha de ingreso
            </dt>
            <dd className="m-0 mt-1 font-semibold text-[#173f6e]">
              <time dateTime={data.fechaIngreso}>
                {formatearFechaHoraAsada(data.fechaIngreso)}
              </time>
            </dd>
          </div>
        </dl>
      </header>

      <section className="mt-6" aria-labelledby="seguimiento-historial-title">
        <h3
          id="seguimiento-historial-title"
          className="m-0 text-base font-extrabold text-[#073b79]"
        >
          Avance del trámite
        </h3>
        <p className="mb-0 mt-1 text-sm leading-6 text-slate-600">
          Eventos públicos registrados. El estado actual también aparece arriba.
        </p>
        <SeguimientoPublicoHistorial
          eventos={data.historial}
          estadoActual={data.estado}
        />
      </section>

      <div className="mt-7 flex flex-wrap gap-3 border-t border-sky-200/80 pt-6 max-[480px]:grid max-[480px]:grid-cols-1">
        {onNuevaConsulta ? (
          <button
            type="button"
            className="group inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-[#1476cf] bg-white px-6 font-extrabold text-[#0b65b5] shadow-[0_7px_18px_rgba(8,114,211,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-[0_12px_24px_rgba(8,114,211,0.2)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-sky-400 motion-reduce:transform-none motion-reduce:transition-none"
            onClick={onNuevaConsulta}
          >
            <IconRefresh className="transition-transform duration-300 group-hover:rotate-[-35deg] motion-reduce:transform-none" size={19} aria-hidden="true" /> Nueva consulta
          </button>
        ) : null}
        <Link
          className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-0 bg-gradient-to-r from-[#0872d3] to-[#3298dc] px-6 font-extrabold text-white no-underline shadow-[0_9px_20px_rgba(8,114,211,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(8,114,211,0.3)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-sky-400 motion-reduce:transform-none motion-reduce:transition-none"
          to="/"
        >
          <IconHome className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none" size={19} aria-hidden="true" /> Ir al inicio
        </Link>
      </div>
    </article>
  )
}
