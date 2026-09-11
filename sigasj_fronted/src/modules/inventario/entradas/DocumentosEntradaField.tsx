import { useRef } from 'react'
import { DOCUMENT_ACCEPT, appendValidDocuments, formatDocumentSize } from './documentosUtils'
import type { SelectedDocument } from './documentosTypes'

export default function DocumentosEntradaField({ documents, disabled, onChange, onErrors }: { documents: SelectedDocument[]; disabled: boolean; onChange: (documents: SelectedDocument[]) => void; onErrors: (errors: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const addFiles = (files: File[]) => {
    const result = appendValidDocuments(documents, files)
    onChange(result.documents)
    onErrors(result.errors)
    if (inputRef.current) inputRef.current.value = ''
  }
  return <fieldset className="inventory-entry__documents materials-admin__form-full" disabled={disabled}>
    <legend>Documentos de respaldo</legend>
    <p>Facturas, recibos o guías en PDF, JPG, PNG o WebP. Máximo 10 MB por archivo.</p>
    <input ref={inputRef} className="visually-hidden" id="entrada-documentos" type="file" accept={DOCUMENT_ACCEPT} multiple onChange={(event) => addFiles(Array.from(event.target.files ?? []))} />
    <label className="inventory-entry__file-button" htmlFor="entrada-documentos">Seleccionar archivos</label>
    {documents.length === 0 ? <p className="inventory-entry__no-files">No hay archivos seleccionados.</p> : <ul className="inventory-entry__file-list">{documents.map((document) => <li key={document.id}><span><strong>{document.file.name}</strong><small>{formatDocumentSize(document.file.size)}</small></span><button type="button" onClick={() => onChange(documents.filter((item) => item.id !== document.id))} aria-label={`Quitar ${document.file.name}`}>Quitar</button></li>)}</ul>}
  </fieldset>
}
