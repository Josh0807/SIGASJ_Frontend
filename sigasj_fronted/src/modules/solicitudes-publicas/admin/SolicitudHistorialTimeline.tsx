import {
  formatearFechaHistorial,
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
      className="rounded-[22px] border border-sky-100 bg-white p-6 shadow-[0_10px_28px_rgba(39,112,166,0.08)] max-[640px]:p-4"
      aria-labelledby="solicitud-historial-title"
    >
      <h2
        id="solicitud-historial-title"
        className="m-0 text-lg font-extrabold text-[#073b79]"
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
        <ol className="relative m-0 mt-6 list-none space-y-0 p-0 before:absolute before:top-2 before:bottom-2 before:left-[0.55rem] before:w-px before:bg-sky-100 max-[640px]:before:left-[0.45rem]">
          {ordenados.map((evento) => {
            const { fecha, hora } = formatearFechaHistorial(evento.fecha)
            const responsable = nombreResponsableHistorial(evento)
            return (
              <li
                key={evento.id}
                className="relative grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 gap-y-1 pb-6 last:pb-0"
              >
                <span
                  className="relative z-10 mt-1.5 size-2.5 rounded-full border-2 border-white bg-[#0b6bcb] shadow-[0_0_0_3px_rgba(11,107,203,0.15)]"
                  aria-hidden="true"
                />
                <article className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 max-[640px]:p-3">
                  <header className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <time
                      className="text-sm font-extrabold text-[#062e63]"
                      dateTime={evento.fecha}
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

                  <p className="mb-0 mt-2 text-base font-extrabold leading-snug text-[#073b79]">
                    {tituloTransicionHistorial(evento)}
                  </p>

                  {evento.estadoAnterior != null &&
                  evento.estadoAnterior !== evento.estadoNuevo ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
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
                    <p className="mb-0 mt-2 text-sm text-slate-600">
                      Realizado por: <strong className="font-bold text-slate-800">{responsable}</strong>
                    </p>
                  ) : null}

                  {evento.observacionPublica ? (
                    <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2">
                      <p className="m-0 text-xs font-extrabold uppercase tracking-wide text-sky-800">
                        Observación pública
                      </p>
                      <p className="mb-0 mt-1 break-words text-sm leading-6 text-slate-800">
                        {evento.observacionPublica}
                      </p>
                    </div>
                  ) : null}

                  {evento.notaInterna ? (
                    <div className="mt-2 rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2">
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
