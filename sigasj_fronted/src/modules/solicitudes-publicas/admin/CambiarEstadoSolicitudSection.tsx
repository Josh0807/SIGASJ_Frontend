import { IconRefresh } from '@tabler/icons-react'
import { useId, useRef, useState } from 'react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import type { SolicitudEstado } from '../types'
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
      className="rounded-[22px] border border-sky-100 bg-white p-6 shadow-[0_10px_28px_rgba(39,112,166,0.08)] max-[640px]:p-4"
      aria-labelledby={`${estadoId}-title`}
    >
      <h2
        id={`${estadoId}-title`}
        className="m-0 text-lg font-extrabold text-[#073b79]"
      >
        Cambiar estado
      </h2>
      <p className="mb-0 mt-2 text-sm leading-6 text-slate-500">
        El cambio se registra con trazabilidad en el Backend. La observación
        pública puede mostrarse al solicitante; la nota interna es solo
        administrativa.
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="grid gap-2 md:col-span-2">
          <p className="m-0 text-sm font-bold text-slate-600">Estado actual</p>
          <p className="m-0 text-base font-extrabold text-[#062e63]">
            {labelEstadoSolicitud(estadoActual)}
          </p>
        </div>

        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-700" htmlFor={estadoId}>
            Nuevo estado
          </label>
          <select
            id={estadoId}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-800 disabled:opacity-60"
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

        <div className="grid gap-2">
          <label className="text-sm font-bold text-slate-700" htmlFor={publicaId}>
            Observación pública
          </label>
          <p className="m-0 text-xs leading-5 text-slate-500">
            Esta observación puede mostrarse al solicitante.
          </p>
          <textarea
            id={publicaId}
            className="min-h-28 w-full resize-y rounded-xl border border-sky-100 bg-sky-50/40 px-3 py-2 text-sm text-slate-800 disabled:opacity-60"
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

        <div className="grid gap-2 rounded-xl border border-amber-100 bg-amber-50/50 p-3">
          <label
            className="text-sm font-bold text-amber-900"
            htmlFor={internaId}
          >
            Nota interna
          </label>
          <p className="m-0 text-xs leading-5 text-amber-800/80">
            Uso interno administrativo. No se muestra al solicitante.
          </p>
          <textarea
            id={internaId}
            className="min-h-28 w-full resize-y rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-slate-800 disabled:opacity-60"
            maxLength={MAX_TEXTO}
            value={notaInterna}
            disabled={busy || disabled}
            onChange={(event) => setNotaInterna(event.target.value)}
            placeholder="Opcional"
          />
          <p className="m-0 text-xs text-amber-700/70">
            {notaInterna.length}/{MAX_TEXTO}
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 mb-0 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex justify-end border-t border-sky-100 pt-5 max-[520px]:block">
        <button
          ref={confirmBtnRef}
          type="button"
          className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-2xl border-0 bg-gradient-to-r from-[#0872d3] to-[#3298dc] px-6 font-extrabold text-white shadow-[0_10px_22px_rgba(8,114,211,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(8,114,211,0.32)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:shadow-[0_10px_22px_rgba(8,114,211,0.24)] motion-reduce:transform-none motion-reduce:transition-none max-[520px]:w-full"
          disabled={!puedeEnviar}
          onClick={abrirConfirmacion}
        >
          <IconRefresh className={`transition-transform duration-300 motion-reduce:transform-none ${busy ? 'animate-spin' : 'group-hover:rotate-[-35deg]'}`} size={19} aria-hidden="true" />
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
