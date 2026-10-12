import { IconUserCheck, IconUserOff } from '@tabler/icons-react'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react'
import ConfirmDialog from '../../shared/components/ConfirmDialog'
import {
  MOTIVO_INACTIVACION_MAX_LENGTH,
  asociadoEstadoError,
  esNoAutenticado,
  nombreCompleto,
  validarMotivoInactivacion,
} from './asociadoForm'
import { cambiarEstadoAsociado } from './asociadosApi'
import type { Asociado } from './types'

type Props = {
  asociado: Asociado
  onCambiado: (actualizado: Asociado) => void
  onError: (mensaje: string) => void
  onNoAutenticado: () => void
  compacto?: boolean
}

type InactivarDialogProps = {
  nombre: string
  guardando: boolean
  error: string | null
  onCancel: () => void
  onConfirm: (motivo: string) => void
  returnFocusRef: RefObject<HTMLButtonElement | null>
}

/** Diálogo de inactivación: el motivo es obligatorio (PBI 5.4.3). */
function InactivarAsociadoDialog({
  nombre,
  guardando,
  error,
  onCancel,
  onConfirm,
  returnFocusRef,
}: InactivarDialogProps) {
  const titleId = useId()
  const hintId = useId()
  const fieldId = useId()
  const errorId = useId()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const [motivo, setMotivo] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const focusReturnTarget = returnFocusRef.current
    document.body.style.overflow = 'hidden'
    textareaRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      focusReturnTarget?.focus()
    }
  }, [returnFocusRef])

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (!guardando) onCancel()
      return
    }
    if (event.key !== 'Tab') return
    const focusables = [textareaRef.current, confirmRef.current, cancelRef.current].filter(
      (item): item is HTMLTextAreaElement | HTMLButtonElement => item !== null && !item.disabled,
    )
    if (!focusables.length) return
    const actual = focusables.findIndex((item) => item === document.activeElement)
    const siguiente = event.shiftKey
      ? actual <= 0 ? focusables.length - 1 : actual - 1
      : actual < 0 || actual >= focusables.length - 1 ? 0 : actual + 1
    event.preventDefault()
    focusables[siguiente]?.focus()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (guardando) return
    const validacion = validarMotivoInactivacion(motivo)
    if (validacion) {
      setFieldError(validacion)
      textareaRef.current?.focus()
      return
    }
    onConfirm(motivo.trim())
  }

  return (
    <div
      className="confirm-dialog"
      role="presentation"
      onClick={() => {
        if (!guardando) onCancel()
      }}
    >
      <div
        className="confirm-dialog__panel max-h-[min(90dvh,40rem)] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={hintId}
        onKeyDown={handleKeyDown}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="confirm-dialog__title">
          Inactivar asociado
        </h2>
        <p id={hintId} className="confirm-dialog__message">
          {nombre} quedará inactivo. Indique el motivo; quedará registrado junto con la fecha de
          inactivación.
        </p>
        <form className="grid w-full gap-2 text-left" onSubmit={handleSubmit} noValidate>
          <label htmlFor={fieldId} className="text-sm font-bold text-[#163f6b]">
            Motivo de la inactivación
          </label>
          <textarea
            ref={textareaRef}
            id={fieldId}
            name="motivo"
            rows={4}
            maxLength={MOTIVO_INACTIVACION_MAX_LENGTH}
            aria-required="true"
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? errorId : undefined}
            disabled={guardando}
            value={motivo}
            placeholder="Ej. Venta de la propiedad"
            className="w-full resize-y rounded-xl font-[inherit] border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
            onChange={(event) => {
              setMotivo(event.target.value)
              if (fieldError) setFieldError(null)
            }}
          />
          <p className="m-0 text-right text-xs text-slate-500">
            {motivo.length}/{MOTIVO_INACTIVACION_MAX_LENGTH}
          </p>
          {fieldError ? (
            <p id={errorId} className="m-0 text-sm font-semibold text-red-700" role="alert">
              {fieldError}
            </p>
          ) : null}
          {error ? (
            <p className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <div className="confirm-dialog__actions w-full">
            <button
              ref={confirmRef}
              type="submit"
              className="confirm-dialog__button confirm-dialog__button--danger group !min-h-12 !rounded-2xl !border-0 !bg-gradient-to-r !from-rose-600 !to-red-600 !px-6 !font-extrabold !text-white !shadow-[0_9px_22px_rgba(225,29,72,0.28)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!from-rose-700 hover:!to-red-700 hover:!shadow-[0_13px_28px_rgba(225,29,72,0.36)] active:!translate-y-0 active:!scale-[0.98] disabled:!transform-none disabled:!opacity-60 motion-reduce:!transform-none motion-reduce:!transition-none"
              disabled={guardando}
            >
              <IconUserOff className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none" size={19} aria-hidden="true" />
              {guardando ? 'Inactivando…' : 'Inactivar'}
            </button>
            <button
              ref={cancelRef}
              type="button"
              className="confirm-dialog__button confirm-dialog__button--secondary !min-h-12 !rounded-2xl !border !border-slate-200 !bg-white !px-6 !font-extrabold !text-slate-700 !shadow-[0_6px_16px_rgba(15,23,42,0.08)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!border-blue-300 hover:!bg-blue-50 hover:!text-blue-800 hover:!shadow-[0_10px_22px_rgba(37,99,235,0.14)] active:!translate-y-0 active:!scale-[0.98] disabled:!transform-none disabled:!opacity-60 motion-reduce:!transform-none motion-reduce:!transition-none"
              onClick={onCancel}
              disabled={guardando}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CambiarEstadoAsociado({
  asociado,
  onCambiado,
  onError,
  onNoAutenticado,
  compacto = false,
}: Props) {
  const [abierto, setAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorDialogo, setErrorDialogo] = useState<string | null>(null)
  const botonRef = useRef<HTMLButtonElement>(null)
  const enviando = useRef(false)
  const inactivar = asociado.activo
  const nombre = nombreCompleto(asociado)

  const cerrar = () => {
    setAbierto(false)
    setErrorDialogo(null)
  }

  const enviar = async (motivo?: string) => {
    if (enviando.current) return
    enviando.current = true
    setGuardando(true)
    setErrorDialogo(null)
    if (!inactivar) setAbierto(false)
    try {
      const actualizado = await cambiarEstadoAsociado(asociado.id, !inactivar, motivo)
      setAbierto(false)
      onCambiado({ ...asociado, ...actualizado })
    } catch (error) {
      if (esNoAutenticado(error)) {
        setAbierto(false)
        onNoAutenticado()
        return
      }
      const mensaje = asociadoEstadoError(error, !inactivar)
      // Al inactivar el error se muestra en el diálogo para no perder el motivo escrito.
      if (inactivar) setErrorDialogo(mensaje)
      else onError(mensaje)
    } finally {
      enviando.current = false
      setGuardando(false)
    }
  }

  const Icono = inactivar ? IconUserOff : IconUserCheck
  const etiqueta = inactivar ? 'Inactivar' : 'Reactivar'
  const tono = inactivar
    ? 'border-rose-200 bg-gradient-to-br from-white to-rose-50 text-rose-700 shadow-[0_5px_14px_rgba(225,29,72,0.1)] hover:border-rose-400 hover:from-rose-50 hover:to-red-100 hover:text-rose-800 hover:shadow-[0_9px_20px_rgba(225,29,72,0.2)]'
    : 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50 text-emerald-700 shadow-[0_5px_14px_rgba(5,150,105,0.1)] hover:border-emerald-400 hover:from-emerald-50 hover:to-teal-100 hover:text-emerald-800 hover:shadow-[0_9px_20px_rgba(5,150,105,0.2)]'

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        className={`group inline-flex items-center justify-center gap-2 rounded-xl border font-extrabold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:transform-none disabled:opacity-60 motion-reduce:transform-none motion-reduce:transition-none ${compacto ? 'min-h-10 px-4 py-2 text-sm' : 'min-h-12 rounded-2xl px-5 py-3'} ${tono}`}
        onClick={() => {
          if (!enviando.current) setAbierto(true)
        }}
        disabled={guardando}
        aria-label={`${etiqueta} a ${nombre}`}
      >
        <Icono className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none" size={compacto ? 17 : 20} aria-hidden="true" />
        {guardando ? 'Guardando…' : etiqueta}
      </button>
      {inactivar && abierto ? (
        <InactivarAsociadoDialog
          nombre={nombre}
          guardando={guardando}
          error={errorDialogo}
          onCancel={cerrar}
          onConfirm={(motivo) => void enviar(motivo)}
          returnFocusRef={botonRef}
        />
      ) : null}
      <ConfirmDialog
        isOpen={!inactivar && abierto}
        title="Reactivar asociado"
        message={`${nombre} volverá a quedar activo y se eliminarán la fecha y el motivo de su inactivación. ¿Desea continuar?`}
        confirmLabel="Reactivar"
        confirmFirst
        onCancel={cerrar}
        onConfirm={() => void enviar()}
        returnFocusRef={botonRef}
      />
    </>
  )
}
