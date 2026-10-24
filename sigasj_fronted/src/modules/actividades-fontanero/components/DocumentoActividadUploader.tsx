import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { IconPhotoPlus } from '@tabler/icons-react'
import ActividadRegistroFieldError from './ActividadRegistroFieldError'
import {
  DOCUMENTO_ACTIVIDAD_ACCEPT,
  formatDocumentoSize,
  validateDocumentoActividad,
} from '../utils/validateDocumentoActividad'

type Props = {
  files: File[]
  onChange: (files: File[]) => void
  error?: string
  disabled?: boolean
  multiple?: boolean
  accept?: string
  validateFile?: (file: File) => string | null
  buttonLabel?: string
  helpText?: string
  listLabel?: string
  dropHint?: string
  maxFiles?: number
}

const fileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`

const DocumentoActividadUploader = ({
  files,
  onChange,
  error,
  disabled = false,
  multiple = false,
  accept = DOCUMENTO_ACTIVIDAD_ACCEPT,
  validateFile = validateDocumentoActividad,
  buttonLabel = 'Agregar archivos',
  helpText = 'Formatos permitidos: PDF, JPG, JPEG y PNG. Máximo 10 MB por archivo.',
  listLabel = 'Archivos seleccionados',
  dropHint = 'Arrastre los archivos aquí o use el botón para seleccionarlos.',
  maxFiles = 5,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragDepth = useRef(0)
  const [isDragging, setIsDragging] = useState(false)
  const [selectionError, setSelectionError] = useState<string | null>(null)

  const applyFiles = (incoming: File[]) => {
    const validFiles: File[] = []
    const messages: string[] = []
    for (const file of incoming) {
      const validationError = validateFile(file)
      if (validationError) messages.push(validationError)
      else validFiles.push(file)
    }
    const candidates = multiple ? [...files, ...validFiles] : validFiles.slice(0, 1)
    const unique = candidates.filter(
      (file, index, all) => all.findIndex((item) => fileKey(item) === fileKey(file)) === index,
    )
    if (unique.length > maxFiles) {
      messages.push(`Puede adjuntar un máximo de ${maxFiles} archivos.`)
    }
    if (validFiles.length > 0) onChange(unique.slice(0, maxFiles))
    setSelectionError(messages.length > 0 ? messages.join(' ') : null)
  }

  const handleSelection = (event: ChangeEvent<HTMLInputElement>) => {
    applyFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (disabled) return
    dragDepth.current += 1
    setIsDragging(true)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (disabled) return
    event.dataTransfer.dropEffect = 'copy'
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    dragDepth.current = 0
    setIsDragging(false)
    if (disabled) return
    applyFiles(Array.from(event.dataTransfer.files ?? []))
  }

  const removeFile = (file: File) => {
    onChange(files.filter((current) => fileKey(current) !== fileKey(file)))
    setSelectionError(null)
    inputRef.current?.focus()
  }

  const displayedError = selectionError ?? error
  return (
    <div className={`documento-uploader${displayedError ? ' documento-uploader--invalid' : ''}`}>
      <input
        ref={inputRef}
        id="documentos"
        name="documentos"
        type="file"
        multiple={multiple}
        accept={accept}
        className="documento-uploader__native"
        onChange={handleSelection}
        aria-invalid={Boolean(displayedError)}
        aria-describedby={displayedError ? 'documentos-error' : 'documentos-help'}
        disabled={disabled}
      />
      <div
        className={`documento-uploader__dropzone${isDragging ? ' documento-uploader__dropzone--active' : ''}${
          disabled ? ' documento-uploader__dropzone--disabled' : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <IconPhotoPlus size={28} stroke={1.8} aria-hidden="true" />
        <p className="documento-uploader__drop-title">
          {isDragging ? 'Suelte las fotos aquí' : dropHint}
        </p>
        <button
          type="button"
          className="documento-uploader__pick"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          {buttonLabel}
        </button>
      </div>
      <p id="documentos-help" className="actividad-formulario-especifico__hint">
        {helpText}
      </p>
      {files.length > 0 ? (
        <ul className="documento-uploader__files" aria-label={listLabel}>
          {files.map((file) => (
            <li key={fileKey(file)} className="documento-uploader__file">
              <span className="documento-uploader__details">
                <strong>{file.name}</strong>
                <span>{formatDocumentoSize(file.size)}</span>
              </span>
              <button
                type="button"
                className="documento-uploader__remove"
                onClick={() => removeFile(file)}
                disabled={disabled}
                aria-label={`Quitar ${file.name}`}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {displayedError ? (
        <ActividadRegistroFieldError id="documentos-error" message={displayedError} />
      ) : null}
    </div>
  )
}

export default DocumentoActividadUploader
