import {
  IconAlertCircle,
  IconCheck,
  IconFileUpload,
  IconLoader2,
  IconTrash,
} from '@tabler/icons-react'
import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { formatDocumentSize, validateDocumentFile } from './documentFileValidation'

export type DocumentFileItem = {
  id: string
  name: string
  size: number
  mimeType?: string
  status?: 'ready' | 'uploading' | 'uploaded' | 'error'
  errorMessage?: string
}

type Props = {
  items: DocumentFileItem[]
  onFilesSelected: (files: File[]) => void | Promise<void>
  onRemove: (id: string) => void
  multiple?: boolean
  label?: string
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'multiple' | 'accept' | 'onChange'>
  error?: ReactNode
}

const statusText = (item: DocumentFileItem) => {
  if (item.status === 'uploading') return 'Subiendo…'
  if (item.status === 'uploaded') return 'Carga completada'
  if (item.status === 'error') return item.errorMessage || 'No fue posible cargar el archivo.'
  return 'Listo para adjuntar'
}

export default function DocumentFileSelector({
  items,
  onFilesSelected,
  onRemove,
  multiple = false,
  label = multiple ? 'Elegir archivos' : 'Elegir archivo',
  inputProps,
  error,
}: Props) {
  const inputId = useId()
  const [selectionErrors, setSelectionErrors] = useState<string[]>([])
  const [validating, setValidating] = useState(false)

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!selected.length) return

    setValidating(true)
    const results = await Promise.all(
      selected.map(async (file) => ({ file, message: await validateDocumentFile(file) })),
    )
    const validFiles = results.filter((result) => !result.message).map((result) => result.file)
    setSelectionErrors(results.flatMap((result) => result.message ? [result.message] : []))
    setValidating(false)
    if (validFiles.length) await onFilesSelected(validFiles)
  }

  return (
    <div className="grid gap-3">
      <label
        className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 px-4 py-3 text-center text-sm font-extrabold text-[#0b65b5] transition hover:border-sky-500 hover:bg-sky-100 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-sky-400"
        htmlFor={inputId}
      >
        {validating ? <IconLoader2 className="animate-spin" size={20} aria-hidden="true" /> : <IconFileUpload size={20} aria-hidden="true" />}
        {validating ? 'Validando archivos…' : label}
        <input
          {...inputProps}
          className="sr-only"
          id={inputId}
          name={inputProps?.name ?? 'documentos'}
          type="file"
          multiple={multiple}
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          disabled={validating || inputProps?.disabled}
          onChange={(event) => void handleChange(event)}
        />
      </label>
      <p className="m-0 text-xs font-semibold leading-5 text-slate-600">
        Formatos permitidos: PDF, JPG, JPEG y PNG. Tamaño máximo: 10 MB por archivo.
      </p>

      {selectionErrors.length ? (
        <div className="grid gap-1 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800" role="alert">
          {selectionErrors.map((message) => <p className="m-0" key={message}>{message}</p>)}
        </div>
      ) : null}
      {error}

      {items.length ? (
        <ul className="m-0 grid list-none gap-2 p-0" aria-label="Archivos seleccionados">
          {items.map((item) => {
            const hasError = item.status === 'error'
            return (
              <li className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 max-[480px]:items-start ${hasError ? 'border-red-200 bg-red-50' : item.status === 'uploading' ? 'border-sky-200 bg-sky-50' : 'border-emerald-200 bg-emerald-50'}`} key={item.id}>
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white">
                  {item.status === 'uploading' ? <IconLoader2 className="animate-spin text-sky-600" size={19} aria-hidden="true" /> : hasError ? <IconAlertCircle className="text-red-600" size={19} aria-hidden="true" /> : <IconCheck className="text-emerald-600" size={19} aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-[#173f6e]" title={item.name}>{item.name}</strong>
                  <small className={hasError ? 'text-red-700' : 'text-slate-600'}>
                    {formatDocumentSize(item.size)} · {statusText(item)}
                  </small>
                </span>
                <button className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-red-600 transition hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-500" type="button" aria-label={`Quitar ${item.name}`} onClick={() => onRemove(item.id)}>
                  <IconTrash size={18} aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
