import { IconRefresh } from '@tabler/icons-react'
import { useId, useRef, useState } from 'react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import type { SolicitudEstado } from '../types'
import SolicitudEstadoBadge from './SolicitudEstadoBadge'
import {
  buildCambiarEstadoPayload,
  cambiarEstadoSolicitudAdmin,
} from './solicitudesAdminApi'
import { mensajeErrorCambioEstado } from './solicitudCambioEstadoMessages'
import {
  estadosDisponiblesParaCambio,
  labelEstadoSolicitud,
} from './solicitudEstadoUi'
import type { CambioEstadoSolicitudResponse } from './solicitudesAdminTypes'

const MAX_TEXTO = 1000

type Props = {
  solicitudId: number
  estadoActual: SolicitudEstado
  disabled?: boolean
  onSuccess: (response: CambioEstadoSolicitudResponse) => void
  onConflictOrGone: () => void
  onUnauthorized: () => void
}

/**
 * Cambio de estado administrativo (4.13.2).
 * Sin optimistic update: el estado visual del detalle solo cambia en onSuccess.
 */
export default function CambiarEstadoSolicitudSection({
  solicitudId,
  estadoActual,
  disabled = false,
  onSuccess,
  onConflictOrGone,
  onUnauthorized,
}: Props) {
  const estadoId = useId()
  const publicaId = useId()
  const internaId = useId()
  const confirmBtnRef = useRef<HTMLButtonElement>(null)

  const opciones = estadosDisponiblesParaCambio(estadoActual)
  const [estadoNuevo, setEstadoNuevo] = useState<SolicitudEstado | ''>(
    opciones[0] ?? '',
  )
  const [observacionPublica, setObservacionPublica] = useState('')
  const [notaInterna, setNotaInterna] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const puedeEnviar =
    Boolean(estadoNuevo) &&
    estadoNuevo !== estadoActual &&
    !busy &&
    !disabled

  const abrirConfirmacion = () => {
    if (!puedeEnviar || !estadoNuevo) return
    setError(null)
    setConfirmOpen(true)
  }

  const confirmar = async () => {
    if (!estadoNuevo || busy || estadoNuevo === estadoActual) return
    setConfirmOpen(false)
    setBusy(true)
    setError(null)

    const payload = buildCambiarEstadoPayload({
      estadoNuevo,
      observacionPublica,
      notaInterna,
    })

    try {
      const response = await cambiarEstadoSolicitudAdmin(solicitudId, payload)
      const estadoPersistido = response.estado ?? response.estadoNuevo
      if (!estadoPersistido) throw new Error('La respuesta no incluyó el estado persistido.')
      setObservacionPublica('')
      setNotaInterna('')
      onSuccess(response)
      const restantes = estadosDisponiblesParaCambio(estadoPersistido)
      setEstadoNuevo(restantes[0] ?? '')
    } catch (err: unknown) {
      const statusMatch = /HTTP\s+(\d{3})/i.exec(
        err instanceof Error ? err.message : '',
      )
      const status = statusMatch ? Number(statusMatch[1]) : null
      if (status === 401) {
        onUnauthorized()
        return
      }
      setError(mensajeErrorCambioEstado(err))
      if (status === 409 || status === 404) {
        onConflictOrGone()
      }
    } finally {
      setBusy(false)
    }
  }

  const mensajeConfirmacion = estadoNuevo
    ? [
        `¿Desea cambiar el estado de esta solicitud de «${labelEstadoSolicitud(estadoActual)}» a «${labelEstadoSolicitud(estadoNuevo)}»?`,
        observacionPublica.trim()
          ? `Observación pública: ${observacionPublica.trim()}`
          : null,
        notaInterna.trim()
          ? `Nota interna: ${notaInterna.trim()}`
          : null,
      ]
        .filter(Boolean)
        .join('\n\n')
    : ''

  return (
    <section
      className="rounded-2xl border border-[color:var(--asada-line,#d7e5f1)] bg-white p-5 shadow-[0_12px_28px_rgba(18,63,112,0.07)] sm:rounded-3xl sm:p-6"
      aria-labelledby={`${estadoId}-title`}
    >
      <h2
        id={`${estadoId}-title`}
        className="m-0 text-lg font-black tracking-tight text-[color:var(--asada-ink,#123f70)]"
      >
        Cambiar estado
      </h2>
      <p className="mb-0 mt-2 text-sm leading-6 text-[color:var(--asada-muted,#5b7390)]">
        El cambio se registra con trazabilidad. La observación pública puede
        mostrarse al solicitante; la nota interna es solo administrativa.
      </p>

      <div className="mt-5 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 rounded-xl border border-[color:var(--asada-line,#d7e5f1)] bg-[#f7fbff] p-3.5">
            <p className="m-0 text-sm font-bold text-[color:var(--asada-muted,#5b7390)]">
              Estado actual
            </p>
            <SolicitudEstadoBadge estado={estadoActual} />
          </div>

          <div className="grid gap-2 rounded-xl border border-[color:var(--asada-line,#d7e5f1)] bg-white p-3.5">
            <label
              className="text-sm font-bold text-[color:var(--asada-ink,#123f70)]"
              htmlFor={estadoId}
            >
              Nuevo estado
            </label>
            <select
              id={estadoId}
              className="min-h-11 w-full rounded-xl border border-[color:var(--asada-line,#d7e5f1)] bg-white px-3.5 font-semibold text-[color:var(--asada-ink,#123f70)] outline-none transition focus:border-[color:var(--asada-navy,#1e5a9c)] focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
              value={estadoNuevo}
              disabled={busy || disabled || opciones.length === 0}
              onChange={(event) =>
                setEstadoNuevo(event.target.value as SolicitudEstado)
              }
            >
              {opciones.length === 0 ? (
                <option value="">No hay estados disponibles</option>
              ) : (
                opciones.map((estado) => (
                  <option key={estado} value={estado}>
                    {labelEstadoSolicitud(estado)}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="grid items-stretch gap-4 md:grid-cols-2">
          <div className="grid gap-2 rounded-xl border border-[color:var(--asada-line,#d7e5f1)] bg-[#f7fbff] p-3.5">
            <label
              className="text-sm font-bold text-[color:var(--asada-ink,#123f70)]"
              htmlFor={publicaId}
            >
              Observación pública
            </label>
            <p className="m-0 text-xs leading-5 text-[color:var(--asada-muted,#5b7390)]">
              Puede mostrarse al solicitante.
            </p>
            <textarea
              id={publicaId}
              className="min-h-28 w-full flex-1 resize-y rounded-xl border border-[color:var(--asada-line,#d7e5f1)] bg-white px-3.5 py-2.5 text-sm text-[color:var(--asada-ink,#123f70)] outline-none transition focus:border-[color:var(--asada-navy,#1e5a9c)] focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
              maxLength={MAX_TEXTO}
              value={observacionPublica}
              disabled={busy || disabled}
              onChange={(event) => setObservacionPublica(event.target.value)}
              placeholder="Opcional"
            />
            <p className="m-0 text-xs text-slate-400">
              {observacionPublica.length}/{MAX_TEXTO}
            </p>
          </div>

          <div className="grid gap-2 rounded-xl border border-amber-200 bg-[#fff9e6] p-3.5">
            <label className="text-sm font-bold text-amber-950" htmlFor={internaId}>
              Nota interna
            </label>
            <p className="m-0 text-xs leading-5 text-amber-900/80">
              Solo administrativa. No se muestra al solicitante.
            </p>
            <textarea
              id={internaId}
              className="min-h-28 w-full flex-1 resize-y rounded-xl border border-amber-300/70 bg-white px-3.5 py-2.5 text-sm text-[color:var(--asada-ink,#123f70)] outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:opacity-60"
              maxLength={MAX_TEXTO}
              value={notaInterna}
              disabled={busy || disabled}
              onChange={(event) => setNotaInterna(event.target.value)}
              placeholder="Opcional"
            />
            <p className="m-0 text-xs text-amber-800/70">
              {notaInterna.length}/{MAX_TEXTO}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <p
          className="mt-4 mb-0 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-[color:var(--asada-line,#d7e5f1)] pt-4">
        <button
          ref={confirmBtnRef}
          type="button"
          className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-0 bg-[color:var(--asada-navy,#1e5a9c)] px-5 font-extrabold text-white shadow-[0_8px_18px_rgba(30,90,156,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#174a82] disabled:cursor-not-allowed disabled:opacity-55 max-[520px]:w-full"
          disabled={!puedeEnviar}
          onClick={abrirConfirmacion}
        >
          <IconRefresh
            className={`transition-transform duration-300 ${busy ? 'animate-spin' : 'group-hover:rotate-[-35deg]'}`}
            size={18}
            aria-hidden="true"
          />
          {busy ? 'Actualizando…' : 'Cambiar estado'}
        </button>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Confirmar cambio de estado"
        message={mensajeConfirmacion}
        confirmLabel={busy ? 'Actualizando…' : 'Confirmar cambio'}
        cancelLabel="Cancelar"
        returnFocusRef={confirmBtnRef}
        onCancel={() => {
          if (!busy) setConfirmOpen(false)
        }}
        onConfirm={() => {
          void confirmar()
        }}
      />
    </section>
  )
}
