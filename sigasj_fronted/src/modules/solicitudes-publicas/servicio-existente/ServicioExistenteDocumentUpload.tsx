import type { ReactNode } from 'react'
import DocumentFileSelector from '../../../shared/components/DocumentFileSelector'
import { getServicioExistenteErrorMessage, subirDocumentoServicioExistente } from './servicioExistenteApi'
import type { DocumentoAdjunto, TipoDocumento } from './types'

type Props = {
  calidadTitular: string
  documentos: DocumentoAdjunto[]
  onChange: (next: DocumentoAdjunto[] | ((previous: DocumentoAdjunto[]) => DocumentoAdjunto[])) => void
  error?: ReactNode
}

const documentTypes: Array<{ type: TipoDocumento; label: string; description: string }> = [
  { type: 'identificacion', label: 'Documento de identificación', description: 'Cédula u otro documento de identificación vigente.' },
  { type: 'poder', label: 'Poder especial o autorización', description: 'Requerido cuando actúa una persona representante legal.' },
]

const newLocalId = () => `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`

const ServicioExistenteDocumentUpload = ({ calidadTitular, documentos, onChange, error }: Props) => {
  const upload = async (pending: DocumentoAdjunto) => {
    if (!pending.archivo) return
    onChange((previous) => previous.map((doc) => doc.localId === pending.localId ? { ...doc, estado: 'subiendo', errorMessage: undefined } : doc))
    try {
      const uploaded = await subirDocumentoServicioExistente(pending.archivo, pending.tipoDocumento)
      onChange((previous) => previous.map((doc) => doc.localId === pending.localId ? { ...doc, ...uploaded, estado: 'cargado' } : doc))
    } catch (uploadError) {
      onChange((previous) => previous.map((doc) => doc.localId === pending.localId ? { ...doc, estado: 'error', errorMessage: getServicioExistenteErrorMessage(uploadError) } : doc))
    }
  }
  const handleFile = async (file: File, tipoDocumento: TipoDocumento) => {
    const pending: DocumentoAdjunto = { localId: newLocalId(), archivo: file, tipoDocumento, nombreOriginal: file.name, tamanio: file.size, tipoArchivo: file.type || 'application/octet-stream', estado: 'pendiente' }
    onChange((previous) => [...previous, pending])
    await upload(pending)
  }

  return (
    <section className="grid gap-4" aria-labelledby="servicio-documentos-title">
      <div>
        <h3 className="m-0 text-lg font-extrabold text-[#073b79]" id="servicio-documentos-title">Documentación requerida</h3>
        <p className="mb-0 mt-2 text-sm leading-6 text-[#607a98]">Selecciona y revisa tus documentos antes de continuar.</p>
      </div>
      {documentTypes.map(({ type, label, description }) => {
        const required = type === 'identificacion' || calidadTitular === 'Representante legal'
        const related = documentos.filter((document) => document.tipoDocumento === type)
        return (
          <article className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 sm:p-5" key={type}>
            <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${required ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{required ? 'Obligatorio' : 'Si aplica'}</span>
            <h4 className="mb-0 mt-3 text-base font-extrabold text-[#173f6e]">{label}</h4>
            <p className="mb-4 mt-1 text-sm text-[#607a98]">{description}</p>
            <DocumentFileSelector
              multiple
              label={`Adjuntar ${label.toLowerCase()}`}
              items={related.map((document) => ({ id: document.localId, name: document.nombreOriginal, size: document.tamanio, mimeType: document.tipoArchivo, status: document.estado === 'pendiente' || document.estado === 'subiendo' ? 'uploading' : document.estado === 'cargado' ? 'uploaded' : 'error', errorMessage: document.errorMessage }))}
              onFilesSelected={(files) => Promise.all(files.map((file) => handleFile(file, type))).then(() => undefined)}
              onRemove={(id) => onChange((previous) => previous.filter((item) => item.localId !== id))}
              onRetry={(id) => {
                const documento = documentos.find((item) => item.localId === id)
                return documento ? upload(documento) : Promise.resolve()
              }}
            />
          </article>
        )
      })}
      {error}
    </section>
  )
}

export default ServicioExistenteDocumentUpload
