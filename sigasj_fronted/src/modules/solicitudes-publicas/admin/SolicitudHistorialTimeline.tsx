import {
  formatearFechaHistorial,
  fechaEventoHistorial,
  nombreResponsableHistorial,
  ordenarHistorialCronologico,
  tituloTransicionHistorial,
} from './solicitudHistorialUtils'
import type { HistorialSolicitudEvento } from './solicitudesAdminTypes'
import {
  claseBadgeEstadoSolicitud,
  labelEstadoSolicitud,
} from './solicitudEstadoUi'

type Props = {
  eventos: readonly HistorialSolicitudEvento[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

/**
 * Timeline administrativa de HistorialSolicitud.
 * Solo para contexto admin (incluye notaInterna). No reutilizar en pantallas públicas.
 */
export default function SolicitudHistorialTimeline({
  eventos,
  loading = false,
  error = null,
  onRetry,
}: Props) {
  const ordenados = ordenarHistorialCronologico(eventos)

  return (
    <section
      className="relative overflow-hidden rounded-[26px] border border-sky-100 bg-white p-7 shadow-[0_14px_36px_rgba(39,112,166,0.1)] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-[#0872d3] before:via-sky-400 before:to-cyan-300 max-[640px]:p-4"
      aria-labelledby="solicitud-historial-title"
    >
      <h2
        id="solicitud-historial-title"
        className="m-0 text-xl font-black tracking-[-0.02em] text-[#073b79]"
      >
        Historial de la solicitud
      </h2>
      <p className="mb-0 mt-2 text-sm leading-6 text-slate-500">
        Evolución cronológica de estados. La nota interna es solo administrativa.
      </p>

      {loading ? (
        <p className="mt-5 mb-0 font-semibold text-slate-600" role="status">
          Cargando historial…
        </p>
      ) : null}

      {!loading && error ? (
        <div
          className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
          role="alert"
        >
          <p className="m-0 text-sm font-semibold text-rose-800">{error}</p>
          {onRetry ? (
            <button
              type="button"
              className="mt-3 min-h-10 rounded-xl border border-blue-200 bg-white px-3 text-sm font-bold text-blue-800"
              onClick={onRetry}
            >
              Reintentar
            </button>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && ordenados.length === 0 ? (
        <p className="mt-5 mb-0 rounded-xl border border-slate-100 bg-slate-50 px-4 py-5 text-sm text-slate-600">
          Aún no se han registrado cambios en esta solicitud.
        </p>
      ) : null}

      {!loading && !error && ordenados.length > 0 ? (
        <ol className="relative m-0 mt-7 list-none space-y-0 p-0 before:absolute before:top-3 before:bottom-3 before:left-[0.7rem] before:w-0.5 before:bg-gradient-to-b before:from-[#1687d4] before:via-sky-200 before:to-sky-50 max-[640px]:before:left-[0.55rem]">
          {ordenados.map((evento) => {
            const fechaHora = fechaEventoHistorial(evento)
            const { fecha, hora } = formatearFechaHistorial(fechaHora)
            const responsable = nombreResponsableHistorial(evento)
            return (
              <li
                key={evento.id}
                className="group relative grid grid-cols-[1.55rem_minmax(0,1fr)] gap-x-4 pb-6 last:pb-0 max-[640px]:grid-cols-[1.2rem_minmax(0,1fr)] max-[640px]:gap-x-3"
              >
                <span
                  className="relative z-10 mt-5 size-3.5 rounded-full border-[3px] border-white bg-[#1476cf] shadow-[0_0_0_4px_rgba(20,118,207,0.16)] transition-transform duration-300 group-hover:scale-125 motion-reduce:transform-none"
                  aria-hidden="true"
                />
                <article className="min-w-0 rounded-[22px] border border-sky-100 bg-[linear-gradient(145deg,#ffffff_0%,#fbfdff_100%)] p-5 shadow-[0_7px_20px_rgba(39,112,166,0.07)] transition-all duration-300 group-hover:border-sky-200 group-hover:shadow-[0_13px_28px_rgba(39,112,166,0.13)] max-[640px]:p-4 motion-reduce:transition-none">
                  <header className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <time
                      className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-[#173f6e]"
                      dateTime={fechaHora}
                    >
                      {fecha}
                      {hora ? (
                        <span className="font-semibold text-slate-500">
                          {' '}
                          · {hora}
                        </span>
                      ) : null}
                    </time>
                  </header>

                  <p className="mb-0 mt-4 text-lg font-black leading-snug tracking-[-0.015em] text-[#073b79]">
                    {tituloTransicionHistorial(evento)}
                  </p>

                  {evento.estadoAnterior != null &&
                  evento.estadoAnterior !== evento.estadoNuevo ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-extrabold ${claseBadgeEstadoSolicitud(evento.estadoAnterior)}`}
                      >
                        {labelEstadoSolicitud(evento.estadoAnterior)}
                      </span>
                      <span className="text-xs font-bold text-slate-400" aria-hidden="true">
                        →
                      </span>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-extrabold ${claseBadgeEstadoSolicitud(evento.estadoNuevo)}`}
                      >
                        {labelEstadoSolicitud(evento.estadoNuevo)}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-extrabold ${claseBadgeEstadoSolicitud(evento.estadoNuevo)}`}
                      >
                        {labelEstadoSolicitud(evento.estadoNuevo)}
                      </span>
                    </div>
                  )}

                  {responsable ? (
                    <p className="mb-0 mt-4 border-t border-slate-100 pt-3 text-sm text-slate-600">
                      Realizado por: <strong className="font-bold text-slate-800">{responsable}</strong>
                    </p>
                  ) : null}

                  {evento.observacionPublica ? (
                    <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-3 shadow-inner">
                      <p className="m-0 text-xs font-extrabold uppercase tracking-wide text-sky-800">
                        Observación pública
                      </p>
                      <p className="mb-0 mt-1 break-words text-sm leading-6 text-slate-800">
                        {evento.observacionPublica}
                      </p>
                    </div>
                  ) : null}

                  {evento.notaInterna ? (
                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 shadow-inner">
                      <p className="m-0 text-xs font-extrabold uppercase tracking-wide text-amber-900">
                        Nota interna
                      </p>
                      <p className="mb-0 mt-1 break-words text-sm leading-6 text-amber-950">
                        {evento.notaInterna}
                      </p>
                    </div>
                  ) : null}
                </article>
              </li>
            )
          })}
        </ol>
      ) : null}
    </section>
  )
}
