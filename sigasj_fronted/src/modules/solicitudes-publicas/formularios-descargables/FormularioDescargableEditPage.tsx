import {
  IconArrowLeft,
  IconCircleCheckFilled,
  IconDeviceFloppy,
  IconFileTypePdf,
  IconUpload,
  IconX,
} from '@tabler/icons-react'
import { type FormEvent, useRef, useState } from 'react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
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
  validateFormularioDescargablePdf,
  validateNombreFormularioDescargable,
} from './validateFormularioDescargable'

type Props = {
  formulario: FormularioDescargableAdmin
  submitting: boolean
  error: string | null
  success: string | null
  onDismissSuccess: () => void
  onBack: () => void
  onSave: (input: UpdateFormularioDescargableInput) => Promise<void>
  onReplacePdf: (file: File) => Promise<void>
}

const toDateInputValue = (iso: string | null) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const FormularioDescargableEditPage = ({
  formulario,
  submitting,
  error,
  success,
  onDismissSuccess,
  onBack,
  onSave,
  onReplacePdf,
}: Props) => {
  const [nombre, setNombre] = useState(formulario.nombre)
  const [descripcion, setDescripcion] = useState(formulario.descripcion ?? '')
  const [fechaPublicacion, setFechaPublicacion] = useState(
    toDateInputValue(formulario.fechaPublicacion),
  )
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [confirmReplace, setConfirmReplace] = useState(false)
  const submitRef = useRef(false)
  const replaceRef = useRef(false)
  const validatingRef = useRef(0)

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

  const selectPdf = async (nextFile: File | null) => {
    const validationId = ++validatingRef.current
    setPdfFile(null)
    setPdfError(null)
    if (!nextFile) return
    const validationError = await validateFormularioDescargablePdf(nextFile)
    if (validationId !== validatingRef.current) return
    if (validationError) {
      setPdfError(validationError)
      return
    }
    setPdfFile(nextFile)
  }

  const replacePdf = async () => {
    if (!pdfFile || replaceRef.current || submitting) return
    replaceRef.current = true
    setConfirmReplace(false)
    try {
      await onReplacePdf(pdfFile)
      setPdfFile(null)
    } finally {
      replaceRef.current = false
    }
  }

  return (
    <main className="admin-content-modern min-w-0">
      <div className="mx-auto grid w-full max-w-[960px] gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4 rounded-[24px] border border-sky-100 bg-white p-7 shadow-[0_12px_32px_rgba(39,112,166,0.08)] max-[640px]:p-5">
          <div className="min-w-0">
            <h1
              className="m-0 text-[clamp(1.75rem,3.5vw,2.35rem)] font-black leading-tight tracking-[-0.03em] text-[#062e63]"
              id="formulario-descargable-edit-title"
            >
              Editar formulario
            </h1>
            <p className="mb-0 mt-3 max-w-2xl text-base leading-7 text-slate-500">
              Primero edite la información del formulario. Si necesita cambiar el
              archivo, use la sección de PDF al final de esta página.
            </p>
          </div>
          <button
            className="inline-flex min-h-[48px] cursor-pointer items-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 font-extrabold text-[#0b65b5] shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
            type="button"
            disabled={submitting}
            onClick={onBack}
          >
            <IconArrowLeft size={19} aria-hidden="true" />
            Volver al listado
          </button>
        </header>

        {success ? (
          <div
            className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 px-5 py-4 shadow-[0_12px_30px_rgba(5,150,105,0.12)]"
            role="status"
          >
            <span
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-600 shadow-inner"
              aria-hidden="true"
            >
              <IconCircleCheckFilled size={27} />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-base font-extrabold text-emerald-950">
                Operación exitosa
              </strong>
              <span className="mt-0.5 block text-sm font-medium text-emerald-800">
                {success}
              </span>
            </div>
            <button
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-emerald-700 transition hover:bg-emerald-100"
              type="button"
              aria-label="Cerrar notificación"
              onClick={onDismissSuccess}
            >
              <IconX size={19} aria-hidden="true" />
            </button>
          </div>
        ) : null}

        {error ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <section
          className="rounded-[24px] border border-sky-100 bg-white p-7 shadow-[0_10px_28px_rgba(39,112,166,0.08)] max-[640px]:p-5"
          aria-labelledby="formulario-descargable-edit-title"
        >
          <form
            className="grid gap-6"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <label className="grid gap-2 font-bold text-[#173f6e]">
              Nombre
              <input
                className="w-full rounded-xl border border-sky-200 bg-white px-4 py-3.5 text-base font-semibold text-[#173f6e] outline-none transition focus:border-[#1476cf] focus:ring-4 focus:ring-sky-100"
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
                className="min-h-40 w-full resize-y rounded-xl border border-sky-200 bg-white px-4 py-3.5 text-base font-semibold leading-7 text-[#173f6e] outline-none transition focus:border-[#1476cf] focus:ring-4 focus:ring-sky-100"
                value={descripcion}
                maxLength={FORMULARIO_DESCARGABLE_DESCRIPCION_MAX}
                disabled={submitting}
                onChange={(event) => setDescripcion(event.target.value)}
              />
              <small className="font-medium text-[#607a98]">
                {descripcion.length}/{FORMULARIO_DESCARGABLE_DESCRIPCION_MAX}{' '}
                caracteres
              </small>
            </label>

            <label className="grid max-w-sm gap-2 font-bold text-[#173f6e]">
              Fecha de publicación
              <input
                className="w-full rounded-xl border border-sky-200 bg-white px-4 py-3.5 text-base font-semibold text-[#173f6e] outline-none transition focus:border-[#1476cf] focus:ring-4 focus:ring-sky-100"
                type="date"
                value={fechaPublicacion}
                disabled={submitting}
                onChange={(event) => setFechaPublicacion(event.target.value)}
              />
              <small className="font-medium text-[#607a98]">
                Deje vacío para marcar como no publicada.
              </small>
            </label>

            <p className="m-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Archivo vigente:{' '}
              <strong className="break-all font-semibold text-[#173f6e]">
                {formulario.nombreArchivoOriginal}
              </strong>
            </p>

            {fieldError ? (
              <p
                className="m-0 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"
                role="alert"
              >
                {fieldError}
              </p>
            ) : null}

            <footer className="flex flex-wrap justify-end gap-3 border-t border-sky-100 pt-6">
              <button
                className="min-h-12 cursor-pointer rounded-xl border-2 border-[#1476cf] bg-white px-6 font-bold text-[#0b65b5] disabled:opacity-60"
                type="button"
                disabled={submitting}
                onClick={onBack}
              >
                Cancelar
              </button>
              <button
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl !border-0 bg-gradient-to-r from-[#0872d3] to-[#3298dc] px-7 font-extrabold text-white shadow-md disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                <IconDeviceFloppy size={19} aria-hidden="true" />
                {submitting ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </footer>
          </form>
        </section>

        <section
          className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-6 max-[640px]:p-5"
          aria-labelledby="formulario-descargable-pdf-title"
        >
          <div className="flex flex-wrap items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-slate-500 shadow-sm">
              <IconFileTypePdf size={22} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2
                className="m-0 text-lg font-extrabold text-[#173f6e]"
                id="formulario-descargable-pdf-title"
              >
                Cambiar PDF (opcional)
              </h2>
              <p className="mb-0 mt-1 text-sm leading-6 text-slate-500">
                Solo si necesita sustituir el archivo. No afecta el resto de la
                información.
              </p>
            </div>
          </div>

          <label className="mt-5 grid gap-2 text-sm font-bold text-[#173f6e]">
            Nuevo archivo
            <input
              className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#173f6e] file:mr-4 file:rounded-lg file:border-0 file:bg-slate-700 file:px-4 file:py-2 file:font-bold file:text-white"
              type="file"
              accept="application/pdf,.pdf"
              disabled={submitting}
              onChange={(event) => {
                void selectPdf(event.target.files?.[0] ?? null)
                event.target.value = ''
              }}
            />
            {pdfFile ? (
              <span className="text-sm font-semibold text-emerald-800">
                Listo para subir: {pdfFile.name}
              </span>
            ) : null}
            {pdfError ? (
              <span className="text-sm font-semibold text-red-800" role="alert">
                {pdfError}
              </span>
            ) : null}
          </label>

          <div className="mt-4 flex justify-end">
            <button
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-700 disabled:opacity-60"
              type="button"
              disabled={submitting || !pdfFile}
              onClick={() => setConfirmReplace(true)}
            >
              <IconUpload size={17} aria-hidden="true" />
              Reemplazar PDF
            </button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={confirmReplace}
        title="Reemplazar PDF"
        message={`Se reemplazará «${formulario.nombreArchivoOriginal}» por «${pdfFile?.name ?? 'el nuevo archivo'}». Esta acción no se puede deshacer.`}
        confirmLabel="Reemplazar PDF"
        cancelLabel="Cancelar"
        confirmDanger
        onCancel={() => {
          if (!submitting) setConfirmReplace(false)
        }}
        onConfirm={() => {
          void replacePdf()
        }}
      />
    </main>
  )
}

export default FormularioDescargableEditPage
