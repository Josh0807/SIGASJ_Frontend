import { IconFile, IconFileUpload } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import DocumentFileSelector from '../../../shared/components/DocumentFileSelector'
import { DOCUMENT_REQUIREMENTS } from '../documentRequirementsConfig'
import { getDisponibilidadErrorMessage, subirDocumentoSolicitud } from './disponibilidadApi'
import { DESCRIPCIONES_TIPO_DOCUMENTO, ETIQUETAS_TIPO_DOCUMENTO, TIPOS_DOCUMENTO_DISP, tiposRequeridosDisponibilidad, type DocumentoAdjunto, type TipoDocumentoDisp } from './documentoAdjunto'

type Props = {
  proposito: string
  calidadTitular: string
  planoCatastrado: string
  documentos: DocumentoAdjunto[]
  onChange: (next: DocumentoAdjunto[] | ((prev: DocumentoAdjunto[]) => DocumentoAdjunto[])) => void
  error?: ReactNode
}

const newLocalId = () => `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
const itemStatus = (estado: DocumentoAdjunto['estado']) => estado === 'subiendo' ? 'uploading' as const : estado === 'cargado' ? 'uploaded' as const : 'error' as const

const DisponibilidadDocumentUpload = ({ proposito, calidadTitular, planoCatastrado, documentos, onChange, error }: Props) => {
  const config = DOCUMENT_REQUIREMENTS['disponibilidad-servicios']
  const requeridos = new Set(tiposRequeridosDisponibilidad({ proposito, calidadTitular, planoCatastrado }))

  const handleFile = async (file: File, tipoDocumento: TipoDocumentoDisp) => {
    const localId = newLocalId()
    const pending: DocumentoAdjunto = { localId, tipoDocumento, nombreOriginal: file.name, tamanio: file.size, tipoArchivo: file.type || 'application/octet-stream', estado: 'subiendo' }
    onChange((prev) => [...prev, pending])
    try {
      const uploaded = await subirDocumentoSolicitud(file, tipoDocumento)
      onChange((prev) => prev.map((doc) => doc.localId === localId ? { ...doc, estado: 'cargado', id: uploaded.id, tokenReclamo: uploaded.tokenReclamo, nombreOriginal: uploaded.nombreOriginal, tamanio: uploaded.tamanio, tipoArchivo: uploaded.tipoArchivo } : doc))
    } catch (uploadError) {
      onChange((prev) => prev.map((doc) => doc.localId === localId ? { ...doc, estado: 'error', errorMessage: getDisponibilidadErrorMessage(uploadError) } : doc))
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_10px_28px_rgba(39,112,166,0.08)]" aria-labelledby="disp-documents-title">
      <header className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50/50 p-5 sm:p-6">
        <span className="mb-3 grid size-11 place-items-center rounded-xl bg-blue-100 text-[#1476cf]"><IconFileUpload size={23} aria-hidden="true" /></span>
        <h3 className="m-0 text-xl font-extrabold text-[#073b79]" id="disp-documents-title">{config.title}</h3>
        <p className="mb-0 mt-2 max-w-3xl text-sm font-medium leading-6 text-[#607a98]">{config.description}</p>
      </header>
      <div className="grid gap-4 p-4 sm:p-6">
        {TIPOS_DOCUMENTO_DISP.map((tipo) => {
          const required = requeridos.has(tipo)
          const related = documentos.filter((doc) => doc.tipoDocumento === tipo)
          return (
            <article className="rounded-xl border border-slate-100 bg-slate-50/70 p-4" key={tipo}>
              <div className="mb-4 flex min-w-0 gap-3"><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-white text-blue-600 shadow-sm"><IconFile size={18} aria-hidden="true" /></span><div className="min-w-0"><span className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.06em] ${required ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{required ? 'Obligatorio' : 'Si aplica'}</span><h4 className="mb-0 mt-2 text-sm font-extrabold text-[#173f6e]">{ETIQUETAS_TIPO_DOCUMENTO[tipo]}</h4><p className="mb-0 mt-1 text-sm font-medium leading-6 text-[#607a98]">{DESCRIPCIONES_TIPO_DOCUMENTO[tipo]}</p></div></div>
              <DocumentFileSelector
                multiple
                label={`Adjuntar ${ETIQUETAS_TIPO_DOCUMENTO[tipo].toLowerCase()}`}
                items={related.map((doc) => ({ id: doc.localId, name: doc.nombreOriginal, size: doc.tamanio, mimeType: doc.tipoArchivo, status: itemStatus(doc.estado), errorMessage: doc.errorMessage }))}
                onFilesSelected={(files) => Promise.all(files.map((file) => handleFile(file, tipo))).then(() => undefined)}
                onRemove={(id) => onChange((prev) => prev.filter((item) => item.localId !== id))}
              />
            </article>
          )
        })}
        {error}
      </div>
    </section>
  )
}

export default DisponibilidadDocumentUpload
