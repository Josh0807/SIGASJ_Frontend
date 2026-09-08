import { useRef, useState, type ChangeEvent } from 'react'
import ActividadRegistroFieldError from './ActividadRegistroFieldError'
import { DOCUMENTO_ACTIVIDAD_ACCEPT, formatDocumentoSize, validateDocumentoActividad } from '../utils/validateDocumentoActividad'

type Props = { files: File[]; onChange: (files: File[]) => void; error?: string; disabled?: boolean; multiple?: boolean }
const fileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`

const DocumentoActividadUploader = ({ files, onChange, error, disabled = false, multiple = false }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectionError, setSelectionError] = useState<string | null>(null)

  const handleSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const validFiles: File[] = []
    const messages: string[] = []
    for (const file of Array.from(event.target.files ?? [])) {
      const validationError = validateDocumentoActividad(file)
      if (validationError) messages.push(validationError)
      else validFiles.push(file)
    }
    const candidates = multiple ? [...files, ...validFiles] : validFiles.slice(0, 1)
    const unique = candidates.filter((file, index, all) => all.findIndex((item) => fileKey(item) === fileKey(file)) === index)
    if (unique.length > 5) messages.push('Puede adjuntar un máximo de 5 documentos.')
    if (validFiles.length > 0) onChange(unique.slice(0, 5))
    setSelectionError(messages.length > 0 ? messages.join(' ') : null)
    event.target.value = ''
  }

  const removeFile = (file: File) => {
    onChange(files.filter((current) => fileKey(current) !== fileKey(file)))
    setSelectionError(null)
    inputRef.current?.focus()
  }

  const displayedError = selectionError ?? error
  return <div className={`documento-uploader${displayedError ? ' documento-uploader--invalid' : ''}`}>
    <input ref={inputRef} id="documentos" name="documentos" type="file" multiple={multiple} accept={DOCUMENTO_ACTIVIDAD_ACCEPT} className="documento-uploader__input" onChange={handleSelection} aria-invalid={Boolean(displayedError)} aria-describedby={displayedError ? 'documentos-error' : 'documentos-help'} disabled={disabled} />
    <p id="documentos-help" className="actividad-formulario-especifico__hint">Formatos permitidos: PDF, JPG, JPEG y PNG. Máximo 10 MB por archivo.</p>
    {files.length > 0 ? <ul className="documento-uploader__files" aria-label="Documentos seleccionados">{files.map((file) => <li key={fileKey(file)} className="documento-uploader__file"><span className="documento-uploader__details"><strong>{file.name}</strong><span>{formatDocumentoSize(file.size)}</span></span><button type="button" className="documento-uploader__remove" onClick={() => removeFile(file)} disabled={disabled} aria-label={`Quitar ${file.name}`}>Quitar archivo</button></li>)}</ul> : null}
    {displayedError ? <ActividadRegistroFieldError id="documentos-error" message={displayedError} /> : null}
  </div>
}

export default DocumentoActividadUploader
