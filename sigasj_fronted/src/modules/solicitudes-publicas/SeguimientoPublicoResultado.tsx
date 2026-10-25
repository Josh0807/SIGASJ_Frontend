import { IconHome } from '@tabler/icons-react'
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

      <div className="mt-6 flex flex-wrap gap-3">
        {onNuevaConsulta ? (
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-sky-200 bg-white px-4 font-bold text-blue-800"
            onClick={onNuevaConsulta}
          >
            Nueva consulta
          </button>
        ) : null}
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white px-4 font-bold text-blue-800 no-underline"
          to="/"
        >
          <IconHome size={18} aria-hidden="true" /> Ir al inicio
        </Link>
      </div>
    </article>
  )
}
