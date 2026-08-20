import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import {
  formatGalleryMaxSizeLabel,
  validateGalleryImageFile,
} from './validateGalleryImageFile'

type GalleryImageDropzoneProps = {
  mode: 'create' | 'edit'
  file: File | null
  previewSource: string | null | undefined
  fileError: string | null
  onFileChange: (file: File | null) => void
  onFileError: (message: string | null) => void
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const GalleryImageDropzone = ({
  mode,
  file,
  previewSource,
  fileError,
  onFileChange,
  onFileError,
}: GalleryImageDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const applyFile = (nextFile: File | null) => {
    if (!nextFile) {
      onFileChange(null)
      onFileError(null)
      return
    }

    const validationError = validateGalleryImageFile(nextFile)
    if (validationError) {
      onFileChange(null)
      onFileError(validationError)
      return
    }

    onFileChange(nextFile)
    onFileError(null)
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    applyFile(event.target.files?.[0] ?? null)
    event.target.value = ''
  }

  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
    applyFile(event.dataTransfer.files?.[0] ?? null)
  }

  const openPicker = () => {
    inputRef.current?.click()
  }

  const required = mode === 'create'
  const dropzoneLabel = required
    ? 'Arrastra tu imagen aquí'
    : 'Arrastra una imagen para reemplazar la actual'

  return (
    <div className="gallery-admin__upload">
      <input
        ref={inputRef}
        className="gallery-admin__file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={onInputChange}
        tabIndex={-1}
        aria-hidden="true"
      />

      {previewSource ? (
        <figure className="gallery-admin__preview-card">
          <img src={previewSource} alt="Vista previa de la fotografía" />
          {file ? (
            <figcaption className="gallery-admin__file-meta">
              <span className="gallery-admin__file-name">{file.name}</span>
              <span>{formatFileSize(file.size)}</span>
            </figcaption>
          ) : mode === 'edit' ? (
            <figcaption className="gallery-admin__file-meta">
              Imagen actual en la galería
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      <div
        className={[
          'gallery-admin__dropzone',
          isDragging ? 'gallery-admin__dropzone--active' : '',
          previewSource ? 'gallery-admin__dropzone--compact' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openPicker()
          }
        }}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        aria-label={
          required
            ? 'Seleccionar imagen para la galería'
            : 'Seleccionar imagen para reemplazar la actual'
        }
      >
        <span className="gallery-admin__dropzone-icon" aria-hidden="true">
          {previewSource ? '↻' : '↑'}
        </span>
        <p className="gallery-admin__dropzone-title">{dropzoneLabel}</p>
        <p className="gallery-admin__dropzone-hint">
          o <strong>haz clic para buscar</strong> en tu equipo
        </p>
        <p className="gallery-admin__dropzone-specs">
          JPG, PNG o WebP · máximo {formatGalleryMaxSizeLabel()}
          {required ? ' · obligatorio' : ' · opcional'}
        </p>
      </div>

      {fileError ? (
        <p className="gallery-admin__form-error" role="alert">
          {fileError}
        </p>
      ) : null}
    </div>
  )
}

export default GalleryImageDropzone
