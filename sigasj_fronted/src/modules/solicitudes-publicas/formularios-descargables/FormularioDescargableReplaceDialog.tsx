import { IconFileTypePdf, IconUpload, IconX } from '@tabler/icons-react'
import { type FormEvent, useRef, useState } from 'react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import type { FormularioDescargableAdmin } from './types'
import { validateFormularioDescargablePdf } from './validateFormularioDescargable'

type Props = {
  formulario: FormularioDescargableAdmin
  submitting: boolean
  onCancel: () => void
  onSave: (file: File) => Promise<void>
}

const FormularioDescargableReplaceDialog = ({
  formulario,
  submitting,
  onCancel,
  onSave,
}: Props) => {
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [confirmReplace, setConfirmReplace] = useState(false)
  const validatingRef = useRef(0)
  const submitRef = useRef(false)

  const selectFile = async (nextFile: File | null) => {
    const validationId = ++validatingRef.current
    setFile(null)
    setFileError(null)
    if (!nextFile) return
    const error = await validateFormularioDescargablePdf(nextFile)
    if (validationId !== validatingRef.current) return
    if (error) {
      setFileError(error)
      return
    }
    setFile(nextFile)
  }

  const save = async () => {
    if (!file || submitRef.current) return
    submitRef.current = true
    setConfirmReplace(false)
    try {
      await onSave(file)
    } finally {
      submitRef.current = false
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      setFileError('Selecciona el nuevo archivo PDF.')
      return
    }
    setConfirmReplace(true)
  }

  return (
    <>
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
          aria-labelledby="formulario-descargable-replace-title"
          onSubmit={handleSubmit}
        >
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="m-0 text-xs font-extrabold uppercase tracking-[0.2em] text-[#1476cf]">
                Formularios descargables
              </p>
              <h2
                className="mb-0 mt-2 text-2xl font-extrabold leading-tight text-[#073b79]"
                id="formulario-descargable-replace-title"
              >
                Reemplazar PDF
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

          <div className="mt-5 rounded-xl bg-sky-50 p-4">
            <span className="block text-sm font-bold text-[#607a98]">
              Formulario
            </span>
            <strong className="mt-1 block text-[#173f6e]">
              {formulario.nombre}
            </strong>
            <span className="mt-2 block text-sm text-[#607a98]">
              Archivo actual: {formulario.nombreArchivoOriginal}
            </span>
          </div>

          <label className="mt-6 grid gap-2 font-bold text-[#173f6e]">
            Nuevo PDF
            <input
              className="block w-full cursor-pointer rounded-xl border border-sky-200 bg-white p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-sky-100 file:px-4 file:py-2 file:font-bold file:text-[#0b65b5]"
              type="file"
              accept="application/pdf,.pdf"
              disabled={submitting}
              onChange={(event) =>
                void selectFile(event.target.files?.[0] ?? null)
              }
            />
            <small className="font-medium text-[#607a98]">
              Únicamente PDF válido. Tamaño máximo: 10 MB.
            </small>
          </label>

          {file ? (
            <p className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              <IconFileTypePdf size={23} aria-hidden="true" /> Archivo
              seleccionado: {file.name}
            </p>
          ) : null}
          {fileError ? (
            <p
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"
              role="alert"
            >
              {fileError}
            </p>
          ) : null}

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
              {submitting ? 'Reemplazando…' : 'Reemplazar'}
            </button>
          </footer>
        </form>
      </div>
      <ConfirmDialog
        isOpen={confirmReplace}
        title="Reemplazar documento"
        message={`Se reemplazará «${formulario.nombreArchivoOriginal}» por el nuevo PDF. El formulario conservará el mismo registro.`}
        confirmLabel="Reemplazar PDF"
        onCancel={() => setConfirmReplace(false)}
        onConfirm={() => {
          void save()
        }}
      />
    </>
  )
}

export default FormularioDescargableReplaceDialog
