import { IconDeviceFloppy, IconX } from '@tabler/icons-react'
import { type FormEvent, useRef, useState } from 'react'
import type {
  FormularioDescargableAdmin,
  UpdateFormularioDescargableInput,
} from './types'
import {
  FORMULARIO_DESCARGABLE_DESCRIPCION_MAX,
  FORMULARIO_DESCARGABLE_NOMBRE_MAX,
} from './types'
import {
  validateDescripcionFormularioDescargable,
  validateNombreFormularioDescargable,
} from './validateFormularioDescargable'

type Props = {
  formulario: FormularioDescargableAdmin
  submitting: boolean
  onCancel: () => void
  onSave: (input: UpdateFormularioDescargableInput) => Promise<void>
}

const toDateInputValue = (iso: string | null) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const FormularioDescargableEditDialog = ({
  formulario,
  submitting,
  onCancel,
  onSave,
}: Props) => {
  const [nombre, setNombre] = useState(formulario.nombre)
  const [descripcion, setDescripcion] = useState(formulario.descripcion ?? '')
  const [fechaPublicacion, setFechaPublicacion] = useState(
    toDateInputValue(formulario.fechaPublicacion),
  )
  const [fieldError, setFieldError] = useState<string | null>(null)
  const submitRef = useRef(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitRef.current || submitting) return

    const nombreError = validateNombreFormularioDescargable(nombre)
    if (nombreError) {
      setFieldError(nombreError)
      return
    }
    const descError = validateDescripcionFormularioDescargable(descripcion)
    if (descError) {
      setFieldError(descError)
      return
    }

    submitRef.current = true
    setFieldError(null)
    try {
      await onSave({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        fechaPublicacion: fechaPublicacion
          ? `${fechaPublicacion}T12:00:00.000Z`
          : null,
      })
    } finally {
      submitRef.current = false
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onCancel()
      }}
    >
      <form
        className="w-full max-w-xl rounded-[24px] bg-white p-7 shadow-2xl max-[560px]:p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="formulario-descargable-edit-title"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="m-0 text-xs font-extrabold uppercase tracking-[0.2em] text-[#1476cf]">
              Formularios descargables
            </p>
            <h2
              className="mb-0 mt-2 text-2xl font-extrabold leading-tight text-[#073b79]"
              id="formulario-descargable-edit-title"
            >
              Editar información
            </h2>
          </div>
          <button
            className="grid size-10 cursor-pointer place-items-center rounded-xl border border-slate-200 bg-white text-slate-600"
            type="button"
            aria-label="Cerrar"
            disabled={submitting}
            onClick={onCancel}
          >
            <IconX size={21} aria-hidden="true" />
          </button>
        </header>

        <p className="mt-4 rounded-xl bg-sky-50 p-4 text-sm text-[#607a98]">
          Archivo actual:{' '}
          <strong className="text-[#173f6e]">
            {formulario.nombreArchivoOriginal}
          </strong>
          . Para cambiar el PDF use «Reemplazar PDF».
        </p>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 font-bold text-[#173f6e]">
            Nombre
            <input
              className="w-full rounded-xl border border-sky-200 bg-white px-3 py-3 text-sm font-semibold text-[#173f6e]"
              value={nombre}
              maxLength={FORMULARIO_DESCARGABLE_NOMBRE_MAX}
              disabled={submitting}
              required
              onChange={(event) => setNombre(event.target.value)}
            />
          </label>
          <label className="grid gap-2 font-bold text-[#173f6e]">
            Descripción
            <textarea
              className="min-h-24 w-full rounded-xl border border-sky-200 bg-white px-3 py-3 text-sm font-semibold text-[#173f6e]"
              value={descripcion}
              maxLength={FORMULARIO_DESCARGABLE_DESCRIPCION_MAX}
              disabled={submitting}
              onChange={(event) => setDescripcion(event.target.value)}
            />
          </label>
          <label className="grid gap-2 font-bold text-[#173f6e]">
            Fecha de publicación
            <input
              className="w-full rounded-xl border border-sky-200 bg-white px-3 py-3 text-sm font-semibold text-[#173f6e]"
              type="date"
              value={fechaPublicacion}
              disabled={submitting}
              onChange={(event) => setFechaPublicacion(event.target.value)}
            />
            <small className="font-medium text-[#607a98]">
              Deje vacío para marcar como no publicada.
            </small>
          </label>
          {fieldError ? (
            <p
              className="m-0 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"
              role="alert"
            >
              {fieldError}
            </p>
          ) : null}
        </div>

        <footer className="mt-7 flex justify-end gap-3 max-[480px]:flex-col-reverse">
          <button
            className="min-h-11 cursor-pointer rounded-xl border-2 border-[#1476cf] bg-white px-6 font-bold text-[#0b65b5] disabled:opacity-60"
            type="button"
            disabled={submitting}
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl !border-0 bg-gradient-to-r from-[#0872d3] to-[#3298dc] px-7 font-extrabold text-white shadow-md disabled:opacity-60"
            type="submit"
            disabled={submitting}
          >
            <IconDeviceFloppy size={19} aria-hidden="true" />
            {submitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </footer>
      </form>
    </div>
  )
}

export default FormularioDescargableEditDialog
