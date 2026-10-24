import { IconAlertCircle, IconCheck, IconFileUpload, IconLoader2, IconTrash } from '@tabler/icons-react'
import type { ReactNode } from 'react'
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

const ServicioExistenteDocumentUpload = ({ calidadTitular, documentos, onChange, error }: Props) => {
  const handleFile = async (file: File | undefined, tipoDocumento: TipoDocumento) => {
    if (!file) return
    const localId = `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const pending: DocumentoAdjunto = {
      localId,
      tipoDocumento,
      nombreOriginal: file.name,
      tamanio: file.size,
      tipoArchivo: file.type || 'application/octet-stream',
      estado: 'subiendo',
    }
    onChange((previous) => [...previous, pending])
    try {
      const uploaded = await subirDocumentoServicioExistente(file, tipoDocumento)
      onChange((previous) => previous.map((doc) => doc.localId === localId ? {
        ...doc,
        ...uploaded,
        estado: 'cargado',
      } : doc))
    } catch (uploadError) {
      onChange((previous) => previous.map((doc) => doc.localId === localId ? {
        ...doc,
        estado: 'error',
        errorMessage: getServicioExistenteErrorMessage(uploadError),
      } : doc))
    }
  }

  return (
    <section className="grid gap-4" aria-labelledby="servicio-documentos-title">
      <div>
        <h3 className="m-0 text-lg font-extrabold text-[#073b79]" id="servicio-documentos-title">Documentación requerida</h3>
        <p className="mb-0 mt-2 text-sm leading-6 text-[#607a98]">Los archivos se cargan antes de enviar la solicitud. Formatos permitidos: PDF, JPG o PNG.</p>
      </div>
      {documentTypes.map(({ type, label, description }) => {
        const required = type === 'identificacion' || calidadTitular === 'Representante legal'
        const related = documentos.filter((document) => document.tipoDocumento === type)
        return (
          <article className="rounded-2xl border border-sky-100 bg-sky-50/40 p-5" key={type}>
            <div className="flex items-start justify-between gap-4 max-[560px]:flex-col">
              <div className="min-w-0 flex-1">
                <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${required ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{required ? 'Obligatorio' : 'Si aplica'}</span>
                <h4 className="mb-0 mt-3 text-base font-extrabold text-[#173f6e]">{label}</h4>
                <p className="mb-0 mt-1 text-sm text-[#607a98]">{description}</p>
              </div>
              <label className="inline-flex h-11 min-w-32 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#1476cf] px-4 text-sm font-extrabold leading-none text-white shadow-[0_6px_14px_rgba(20,118,207,0.2)] transition hover:-translate-y-0.5 hover:bg-[#0d68bd] focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-sky-400 max-[560px]:w-full motion-reduce:transform-none">
                <IconFileUpload className="shrink-0" size={18} stroke={2.2} aria-hidden="true" />
                <span>Adjuntar</span>
                <input className="sr-only" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; void handleFile(file, type) }} />
              </label>
            </div>
            {related.length ? (
              <ul className="mb-0 mt-4 grid list-none gap-2 p-0">
                {related.map((document) => (
                  <li className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3" key={document.localId}>
                    {document.estado === 'subiendo' ? <IconLoader2 className="shrink-0 animate-spin text-sky-600" /> : document.estado === 'error' ? <IconAlertCircle className="shrink-0 text-red-600" /> : <IconCheck className="shrink-0 text-emerald-600" />}
                    <span className="min-w-0 flex-1"><strong className="block truncate text-sm text-[#173f6e]">{document.nombreOriginal}</strong><small className={document.estado === 'error' ? 'text-red-700' : 'text-[#607a98]'}>{document.estado === 'subiendo' ? 'Subiendo…' : document.estado === 'error' ? document.errorMessage : 'Carga completada'}</small></span>
                    <button className="grid size-9 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-red-600 hover:bg-red-50" type="button" aria-label={`Quitar ${document.nombreOriginal}`} onClick={() => onChange((previous) => previous.filter((item) => item.localId !== document.localId))}><IconTrash size={18} /></button>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        )
      })}
      {error}
    </section>
  )
}

export default ServicioExistenteDocumentUpload
