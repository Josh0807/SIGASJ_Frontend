import type { ReactNode } from 'react'
import DocumentFileSelector from '../../shared/components/DocumentFileSelector'
import {
  errorDocumentoSolicitud,
  nuevoDocumentoSolicitud,
  subirDocumentoSolicitud,
  type DocumentoSolicitudAdjunto,
  type TipoDocumentoSolicitud,
} from './solicitudDocumentos'

export type SolicitudDocumentOption = {
  type: TipoDocumentoSolicitud
  label: string
  description: string
  required: boolean
}

type Props = {
  title?: string
  description?: string
  options: SolicitudDocumentOption[]
  documentos: DocumentoSolicitudAdjunto[]
  onChange: (
    next: DocumentoSolicitudAdjunto[] |
      ((previous: DocumentoSolicitudAdjunto[]) => DocumentoSolicitudAdjunto[]),
  ) => void
  error?: ReactNode
}

const itemStatus = (estado: DocumentoSolicitudAdjunto['estado']) => {
  if (estado === 'pendiente' || estado === 'subiendo') return 'uploading' as const
  if (estado === 'cargado') return 'uploaded' as const
  return 'error' as const
}

export default function SolicitudDocumentUpload({
  title = 'Documentación requerida',
  description = 'Los archivos se cargan antes de registrar la solicitud.',
  options,
  documentos,
  onChange,
  error,
}: Props) {
  const upload = async (documento: DocumentoSolicitudAdjunto) => {
    onChange((previous) => previous.map((item) =>
      item.localId === documento.localId
        ? { ...item, estado: 'subiendo', errorMessage: undefined }
        : item,
    ))
    try {
      const uploaded = await subirDocumentoSolicitud(documento.archivo, documento.tipoDocumento)
      onChange((previous) => previous.map((item) =>
        item.localId === documento.localId
          ? { ...item, ...uploaded, estado: 'cargado', errorMessage: undefined }
          : item,
      ))
    } catch (caught) {
      onChange((previous) => previous.map((item) =>
        item.localId === documento.localId
          ? { ...item, estado: 'error', errorMessage: errorDocumentoSolicitud(caught) }
          : item,
      ))
    }
  }

  const addFiles = async (files: File[], tipoDocumento: TipoDocumentoSolicitud) => {
    const pending = files.map((file) => nuevoDocumentoSolicitud(file, tipoDocumento))
    onChange((previous) => [...previous, ...pending])
    await Promise.all(pending.map(upload))
  }

  return (
    <section className="grid gap-4" aria-labelledby="solicitud-documentos-title">
      <div>
        <h3 className="m-0 text-lg font-extrabold text-[#073b79]" id="solicitud-documentos-title">{title}</h3>
        <p className="mb-0 mt-2 text-sm leading-6 text-[#607a98]">{description}</p>
      </div>
      {options.map((option) => {
        const related = documentos.filter((documento) => documento.tipoDocumento === option.type)
        return (
          <article className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 sm:p-5" key={option.type}>
            <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${option.required ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
              {option.required ? 'Obligatorio' : 'Si aplica'}
            </span>
            <h4 className="mb-0 mt-3 text-base font-extrabold text-[#173f6e]">{option.label}</h4>
            <p className="mb-4 mt-1 text-sm text-[#607a98]">{option.description}</p>
            <DocumentFileSelector
              multiple
              label={`Adjuntar ${option.label.toLowerCase()}`}
              items={related.map((documento) => ({
                id: documento.localId,
                name: documento.nombreOriginal,
                size: documento.tamanio,
                mimeType: documento.tipoArchivo,
                status: itemStatus(documento.estado),
                errorMessage: documento.errorMessage,
              }))}
              onFilesSelected={(files) => addFiles(files, option.type)}
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
