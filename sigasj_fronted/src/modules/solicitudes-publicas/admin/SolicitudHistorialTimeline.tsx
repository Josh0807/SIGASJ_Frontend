import {
  IconChevronDown,
  IconHistory,
  IconRefresh,
  IconUser,
} from '@tabler/icons-react'
import { useId, useState } from 'react'
import {
  formatearFechaHistorial,
  fechaEventoHistorial,
  nombreResponsableHistorial,
  ordenarHistorialCronologico,
  tituloTransicionHistorial,
} from './solicitudHistorialUtils'
import type { HistorialSolicitudEvento } from './solicitudesAdminTypes'
import SolicitudEstadoBadge from './SolicitudEstadoBadge'

type Props = {
  eventos: readonly HistorialSolicitudEvento[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  /** Si true, el panel inicia abierto. Default: true. */
  defaultOpen?: boolean
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
  defaultOpen = true,
}: Props) {
  const panelId = useId()
  const [abierto, setAbierto] = useState(defaultOpen)
  const ordenados = ordenarHistorialCronologico(eventos)
  const ultimoId = ordenados[ordenados.length - 1]?.id ?? null
  /** `undefined` = abrir el último evento automáticamente al cargar. */
  const [eventoAbiertoId, setEventoAbiertoId] = useState<number | null | undefined>(
    undefined,
  )
  const idDetalleAbierto =
    eventoAbiertoId === undefined ? ultimoId : eventoAbiertoId

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[color:var(--asada-line,#d7e5f1)] bg-white shadow-[0_10px_24px_rgba(18,63,112,0.06)]"
      aria-labelledby="solicitud-historial-title"
    >
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-4 py-3.5 text-left transition hover:bg-[#f7fbff] sm:px-5"
        aria-expanded={abierto}
        aria-controls={panelId}
        onClick={() => setAbierto((value) => !value)}
      >
        <div className="min-w-0">
          <h2
            id="solicitud-historial-title"
            className="m-0 flex items-center gap-2.5 text-base font-black tracking-tight text-[color:var(--asada-ink,#123f70)] sm:text-lg"
          >
            <span className="grid size-8 place-items-center rounded-xl bg-[color:var(--asada-ice,#eaf6ff)] text-[color:var(--asada-navy,#1e5a9c)]">
              <IconHistory size={18} aria-hidden="true" />
            </span>
            Historial de la solicitud
            {!loading && !error && ordenados.length > 0 ? (
              <span className="inline-flex min-h-6 items-center rounded-full bg-[color:var(--asada-ice,#eaf6ff)] px-2 text-[0.7rem] font-bold text-[color:var(--asada-navy,#1e5a9c)]">
                {ordenados.length}
              </span>
            ) : null}
          </h2>
          <p className="mb-0 mt-1 text-sm font-semibold leading-5 text-[color:var(--asada-muted,#5b7390)]">
            Evolución cronológica · la nota interna es solo administrativa
          </p>
        </div>
        <span
          className={`grid size-8 shrink-0 place-items-center rounded-xl border border-[color:var(--asada-line,#d7e5f1)] bg-white text-[color:var(--asada-navy,#1e5a9c)] transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <IconChevronDown size={16} />
        </span>
      </button>

      <div id={panelId} hidden={!abierto} className="border-t border-[color:var(--asada-line,#d7e5f1)]">
        {loading ? (
          <div className="grid gap-1.5 p-3" role="status">
            <span className="sr-only">Cargando historial…</span>
            {[0, 1, 2].map((fila) => (
              <div
                key={fila}
                className="h-11 animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <div className="m-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3" role="alert">
            <p className="m-0 text-sm font-semibold text-rose-800">{error}</p>
            {onRetry ? (
              <button
                type="button"
                className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#bfe3fa] bg-white px-3 text-sm font-extrabold text-[color:var(--asada-navy,#1e5a9c)]"
                onClick={onRetry}
              >
                <IconRefresh size={15} aria-hidden="true" />
                Reintentar
              </button>
            ) : null}
          </div>
        ) : null}

        {!loading && !error && ordenados.length === 0 ? (
          <p className="m-3 mb-3 rounded-xl border border-dashed border-[#bfe3fa] bg-[#f7fbff] px-3 py-4 text-center text-sm font-semibold text-[color:var(--asada-muted,#5b7390)]">
            Aún no se han registrado cambios en esta solicitud.
          </p>
        ) : null}

        {!loading && !error && ordenados.length > 0 ? (
          <ol className="relative m-0 list-none p-0 before:absolute before:top-3.5 before:bottom-3.5 before:left-[1.35rem] before:w-px before:bg-[#bfe3fa] sm:before:left-[1.55rem]">
            {ordenados.map((evento, index) => {
              const fechaHora = fechaEventoHistorial(evento)
              const { fecha, hora } = formatearFechaHistorial(fechaHora)
              const responsable = nombreResponsableHistorial(evento)
              const tieneTransicion =
                evento.estadoAnterior != null &&
                evento.estadoAnterior !== evento.estadoNuevo
              const tieneDetalle = Boolean(
                evento.observacionPublica || evento.notaInterna || responsable,
              )
              const detalleAbierto = idDetalleAbierto === evento.id
              const esUltimo = index === ordenados.length - 1

              return (
                <li
                  key={evento.id}
                  className={`relative ${esUltimo ? '' : 'border-b border-[color:var(--asada-line,#d7e5f1)]'}`}
                >
                  <div className="grid grid-cols-[2.2rem_minmax(0,1fr)] gap-x-1 sm:grid-cols-[2.6rem_minmax(0,1fr)]">
                    <span className="relative z-10 flex justify-center pt-3" aria-hidden="true">
                      <span
                        className={`size-2.5 rounded-full border-2 border-white ${detalleAbierto ? 'bg-[color:var(--asada-navy,#1e5a9c)] shadow-[0_0_0_3px_rgba(30,90,156,0.18)]' : 'bg-sky-400'}`}
                      />
                    </span>

                    <div className="min-w-0 py-2.5 pr-3 sm:pr-4">
                      {tieneDetalle ? (
                        <button
                          type="button"
                          className="flex w-full cursor-pointer items-start gap-2 border-0 bg-transparent p-0 text-left"
                          aria-expanded={detalleAbierto}
                          onClick={() =>
                            setEventoAbiertoId(detalleAbierto ? null : evento.id)
                          }
                        >
                          <EventoResumen
                            fecha={fecha}
                            hora={hora}
                            fechaHora={fechaHora}
                            titulo={tituloTransicionHistorial(evento)}
                            tieneTransicion={tieneTransicion}
                            estadoAnterior={evento.estadoAnterior}
                            estadoNuevo={evento.estadoNuevo}
                          />
                          <span
                            className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg text-[color:var(--asada-navy,#1e5a9c)] transition-transform duration-200 ${detalleAbierto ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                          >
                            <IconChevronDown size={15} />
                          </span>
                        </button>
                      ) : (
                        <EventoResumen
                          fecha={fecha}
                          hora={hora}
                          fechaHora={fechaHora}
                          titulo={tituloTransicionHistorial(evento)}
                          tieneTransicion={tieneTransicion}
                          estadoAnterior={evento.estadoAnterior}
                          estadoNuevo={evento.estadoNuevo}
                        />
                      )}

                      {tieneDetalle && detalleAbierto ? (
                        <div className="mt-2 space-y-2">
                          {responsable ? (
                            <p className="mb-0 flex items-center gap-1.5 text-sm font-semibold text-[color:var(--asada-muted,#5b7390)]">
                              <IconUser
                                className="shrink-0 text-[color:var(--asada-navy,#1e5a9c)]"
                                size={14}
                                aria-hidden="true"
                              />
                              <span>
                                Realizado por{' '}
                                <strong className="font-bold text-[color:var(--asada-ink,#123f70)]">
                                  {responsable}
                                </strong>
                              </span>
                            </p>
                          ) : null}

                          {evento.observacionPublica ? (
                            <div className="rounded-xl border border-[#bfe3fa] bg-[color:var(--asada-ice,#eaf6ff)] px-3 py-2.5">
                              <p className="m-0 text-xs font-semibold tracking-wide text-[color:var(--asada-navy,#1e5a9c)]">
                                Observación pública
                              </p>
                              <p className="mb-0 mt-1 break-words text-sm font-semibold leading-5 text-[color:var(--asada-ink,#123f70)]">
                                {evento.observacionPublica}
                              </p>
                            </div>
                          ) : null}

                          {evento.notaInterna ? (
                            <div className="rounded-xl border border-amber-200 bg-[#fff9e6] px-3 py-2.5">
                              <p className="m-0 text-xs font-semibold tracking-wide text-amber-900">
                                Nota interna
                              </p>
                              <p className="mb-0 mt-1 break-words text-sm font-semibold leading-5 text-amber-950">
                                {evento.notaInterna}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        ) : null}
      </div>
    </section>
  )
}

function EventoResumen({
  fecha,
  hora,
  fechaHora,
  titulo,
  tieneTransicion,
  estadoAnterior,
  estadoNuevo,
}: {
  fecha: string
  hora: string
  fechaHora: string
  titulo: string
  tieneTransicion: boolean
  estadoAnterior: string | null
  estadoNuevo: string
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-0 text-[0.95rem] font-black leading-snug tracking-tight text-[color:var(--asada-ink,#123f70)]">
        {titulo}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <time
          className="text-xs font-semibold tabular-nums text-[color:var(--asada-muted,#5b7390)]"
          dateTime={fechaHora}
        >
          {fecha}
          {hora ? ` · ${hora}` : ''}
        </time>
        <span className="text-[color:var(--asada-line,#d7e5f1)]" aria-hidden="true">
          |
        </span>
        <div className="flex flex-wrap items-center gap-1">
          {tieneTransicion ? (
            <>
              <SolicitudEstadoBadge estado={estadoAnterior!} size="sm" />
              <span
                className="text-xs font-semibold text-[color:var(--asada-muted,#5b7390)]"
                aria-hidden="true"
              >
                →
              </span>
              <SolicitudEstadoBadge estado={estadoNuevo} size="sm" />
            </>
          ) : (
            <SolicitudEstadoBadge estado={estadoNuevo} size="sm" />
          )}
        </div>
      </div>
    </div>
  )
}
