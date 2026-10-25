import { IconFileTypePdf, IconTrash, IconUpload, IconX } from '@tabler/icons-react'
import { type FormEvent, useRef, useState } from 'react'
import type { CreateFormularioDescargableInput } from './types'
import {
  FORMULARIO_DESCARGABLE_DESCRIPCION_MAX,
  FORMULARIO_DESCARGABLE_NOMBRE_MAX,
} from './types'
import {
  validateDescripcionFormularioDescargable,
  validateFormularioDescargablePdf,
  validateNombreFormularioDescargable,
} from './validateFormularioDescargable'

type Props = {
  submitting: boolean
  onCancel: () => void
  onSave: (input: CreateFormularioDescargableInput) => Promise<void>
}

const FormularioDescargableCreateDialog = ({
  submitting,
  onCancel,
  onSave,
}: Props) => {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  /** Default alineado con Backend 4.15.2: activo = false. */
  const [activo, setActivo] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const validatingRef = useRef(0)
  const submitRef = useRef(false)

  const clearFile = () => {
    validatingRef.current += 1
    setFile(null)
    setFieldError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const selectFile = async (nextFile: File | null) => {
    const validationId = ++validatingRef.current
    setFile(null)
    setFieldError(null)
    if (!nextFile) return
    const error = await validateFormularioDescargablePdf(nextFile)
    if (validationId !== validatingRef.current) return
    if (error) {
      setFieldError(error)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setFile(nextFile)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitRef.current || submitting) return

    const nombreError = validateNombreFormularioDescargable(nombre)
    if (nombreError) {
      setFieldError(nombreError)
      return
    }
    const descError = validateDescripcionFormularioDescargable(descripcion, {
      required: true,
    })
    if (descError) {
      setFieldError(descError)
      return
    }
    if (!file) {
      setFieldError('Debe seleccionar un archivo PDF.')
      return
    }

    submitRef.current = true
    setFieldError(null)
    try {
      await onSave({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        activo,
        archivo: file,
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
        aria-labelledby="formulario-descargable-create-title"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="m-0 text-xs font-extrabold uppercase tracking-[0.2em] text-[#1476cf]">
              Formularios descargables
            </p>
            <h2
              className="mb-0 mt-2 text-2xl font-extrabold leading-tight text-[#073b79]"
              id="formulario-descargable-create-title"
            >
              Agregar formulario
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

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 font-bold text-[#173f6e]">
            Nombre del formulario
            <input
              className="w-full rounded-xl border border-sky-200 bg-white px-3 py-3 text-sm font-semibold text-[#173f6e]"
              name="nombre"
              value={nombre}
              maxLength={FORMULARIO_DESCARGABLE_NOMBRE_MAX}
              disabled={submitting}
              required
              aria-required="true"
              onChange={(event) => setNombre(event.target.value)}
            />
          </label>

          <label className="grid gap-2 font-bold text-[#173f6e]">
            Descripción breve
            <textarea
              className="min-h-24 w-full rounded-xl border border-sky-200 bg-white px-3 py-3 text-sm font-semibold text-[#173f6e]"
              name="descripcion"
              value={descripcion}
              maxLength={FORMULARIO_DESCARGABLE_DESCRIPCION_MAX}
              disabled={submitting}
              required
              aria-required="true"
              onChange={(event) => setDescripcion(event.target.value)}
            />
          </label>

          <fieldset className="m-0 grid gap-2 border-0 p-0">
            <legend className="mb-0 font-bold text-[#173f6e]">Estado</legend>
            <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
              <label
                className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-sm font-extrabold transition ${
                  !activo
                    ? 'border-slate-400 bg-slate-100 text-slate-800'
                    : 'border-sky-200 bg-white text-[#607a98]'
                }`}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="estado"
                  value="inactivo"
                  checked={!activo}
                  disabled={submitting}
                  onChange={() => setActivo(false)}
                />
                Inactivo
              </label>
              <label
                className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-sm font-extrabold transition ${
                  activo
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                    : 'border-sky-200 bg-white text-[#607a98]'
                }`}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="estado"
                  value="activo"
                  checked={activo}
                  disabled={submitting}
                  onChange={() => setActivo(true)}
                />
                Activo
              </label>
            </div>
            <small className="font-medium text-[#607a98]">
              Por defecto: Inactivo (coherente con el Backend).
            </small>
          </fieldset>

          <label className="grid gap-2 font-bold text-[#173f6e]">
            Archivo PDF
            <input
              ref={fileInputRef}
              className="block w-full cursor-pointer rounded-xl border border-sky-200 bg-white p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-sky-100 file:px-4 file:py-2 file:font-bold file:text-[#0b65b5]"
              type="file"
              name="archivo"
              accept="application/pdf,.pdf"
              disabled={submitting}
              aria-required="true"
              onChange={(event) =>
                void selectFile(event.target.files?.[0] ?? null)
              }
            />
            <small className="font-medium text-[#607a98]">
              Obligatorio. Solo PDF válido. Tamaño máximo: 10 MB.
            </small>
          </label>

          {file ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              <IconFileTypePdf size={23} aria-hidden="true" />
              <span className="min-w-0 flex-1 break-all">
                Archivo seleccionado: {file.name}
              </span>
              <button
                className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-lg border border-emerald-300 bg-white px-3 text-xs font-extrabold text-emerald-900 disabled:opacity-60"
                type="button"
                disabled={submitting}
                onClick={clearFile}
              >
                <IconTrash size={15} aria-hidden="true" /> Quitar
              </button>
            </div>
          ) : null}

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
            <IconUpload size={19} aria-hidden="true" />
            {submitting ? 'Guardando…' : 'Guardar formulario'}
          </button>
        </footer>
      </form>
    </div>
  )
}

export default FormularioDescargableCreateDialog
