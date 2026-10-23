import {
  IconAlertCircle,
  IconCheck,
  IconFile,
  IconFileUpload,
  IconLoader2,
  IconTrash,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { DOCUMENT_REQUIREMENTS } from '../documentRequirementsConfig'
import {
  getDisponibilidadErrorMessage,
  subirDocumentoSolicitud,
} from './disponibilidadApi'
import {
  DESCRIPCIONES_TIPO_DOCUMENTO,
  ETIQUETAS_TIPO_DOCUMENTO,
  TIPOS_DOCUMENTO_DISP,
  tiposRequeridosDisponibilidad,
  type DocumentoAdjunto,
  type TipoDocumentoDisp,
} from './documentoAdjunto'

type Props = {
  proposito: string
  calidadTitular: string
  planoCatastrado: string
  documentos: DocumentoAdjunto[]
  onChange: (
    next:
      | DocumentoAdjunto[]
      | ((prev: DocumentoAdjunto[]) => DocumentoAdjunto[]),
  ) => void
  error?: ReactNode
}

const newLocalId = () =>
  `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const DisponibilidadDocumentUpload = ({
  proposito,
  calidadTitular,
  planoCatastrado,
  documentos,
  onChange,
  error,
}: Props) => {
  const config = DOCUMENT_REQUIREMENTS['disponibilidad-servicios']
  const requeridos = new Set(
    tiposRequeridosDisponibilidad({
      proposito,
      calidadTitular,
      planoCatastrado,
    }),
  )

  const handleSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    tipoDocumento: TipoDocumentoDisp,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const localId = newLocalId()
    const pending: DocumentoAdjunto = {
      localId,
      tipoDocumento,
      nombreOriginal: file.name,
      tamanio: file.size,
      tipoArchivo: file.type || 'application/octet-stream',
      estado: 'subiendo',
    }
    onChange((prev) => [...prev, pending])

    try {
      const uploaded = await subirDocumentoSolicitud(file, tipoDocumento)
      onChange((prev) =>
        prev.map((doc) =>
          doc.localId === localId
            ? {
                ...doc,
                estado: 'cargado',
                id: uploaded.id,
                tokenReclamo: uploaded.tokenReclamo,
                nombreOriginal: uploaded.nombreOriginal,
                tamanio: uploaded.tamanio,
                tipoArchivo: uploaded.tipoArchivo,
              }
            : doc,
        ),
      )
    } catch (uploadError) {
      onChange((prev) =>
        prev.map((doc) =>
          doc.localId === localId
            ? {
                ...doc,
                estado: 'error',
                errorMessage: getDisponibilidadErrorMessage(uploadError),
              }
            : doc,
        ),
      )
    }
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_10px_28px_rgba(39,112,166,0.08)]"
      aria-labelledby="disp-documents-title"
    >
      <header className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50/50 p-5 sm:p-6">
        <span className="mb-3 grid size-11 place-items-center rounded-xl bg-blue-100 text-[#1476cf]">
          <IconFileUpload size={23} aria-hidden="true" />
        </span>
        <h3
          className="m-0 text-xl font-extrabold text-[#073b79]"
          id="disp-documents-title"
        >
          {config.title}
        </h3>
        <p className="mb-0 mt-2 max-w-3xl text-sm font-medium leading-6 text-[#607a98]">
          {config.description} Cada archivo se sube al servidor antes de enviar
          la solicitud; solo cuentan referencias confirmadas (id + token).
        </p>
        <p className="mb-0 mt-2 text-xs font-semibold text-[#315d87]">
          Formato permitido: PDF, JPG o PNG. Tamaño máximo según política del
          servidor.
        </p>
      </header>

      <div className="grid gap-4 p-5 sm:p-6">
        {TIPOS_DOCUMENTO_DISP.map((tipo) => {
          const required = requeridos.has(tipo)
          const related = documentos.filter((doc) => doc.tipoDocumento === tipo)
          return (
            <article
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
              key={tipo}
            >
              <div className="flex min-w-0 gap-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-white text-blue-600 shadow-sm">
                  <IconFile size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.06em] ${
                      required
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {required ? 'Obligatorio' : 'Si aplica'}
                  </span>
                  <h4 className="mb-0 mt-2 text-sm font-extrabold text-[#173f6e]">
                    {ETIQUETAS_TIPO_DOCUMENTO[tipo]}
                  </h4>
                  <p className="mb-0 mt-1 text-sm font-medium leading-6 text-[#607a98]">
                    {DESCRIPCIONES_TIPO_DOCUMENTO[tipo]}
                  </p>
                  <label className="mt-3 grid cursor-pointer gap-1 text-sm font-bold text-[#0b65b5]">
                    Subir archivo (PDF, JPG o PNG)
                    <input
                      className="block w-full cursor-pointer rounded-xl border border-sky-200 bg-white p-3 text-sm font-medium file:mr-4 file:rounded-lg file:border-0 file:bg-sky-100 file:px-4 file:py-2 file:font-bold file:text-[#0b65b5]"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={(event) => void handleSelect(event, tipo)}
                    />
                  </label>
                </div>
              </div>

              {related.length > 0 ? (
                <ul className="mb-0 mt-3 grid list-none gap-2 p-0">
                  {related.map((doc) => (
                    <li
                      className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 ${
                        doc.estado === 'cargado'
                          ? 'border-emerald-200 bg-emerald-50'
                          : doc.estado === 'error'
                            ? 'border-red-200 bg-red-50'
                            : 'border-sky-200 bg-sky-50'
                      }`}
                      key={doc.localId}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white">
                        {doc.estado === 'subiendo' ? (
                          <IconLoader2
                            className="animate-spin text-sky-600"
                            size={18}
                            aria-hidden="true"
                          />
                        ) : doc.estado === 'error' ? (
                          <IconAlertCircle
                            className="text-red-600"
                            size={18}
                            aria-hidden="true"
                          />
                        ) : (
                          <IconCheck
                            className="text-emerald-600"
                            size={18}
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm text-[#173f6e]">
                          {doc.nombreOriginal}
                        </strong>
                        <small className="text-[#607a98]">
                          {doc.estado === 'subiendo'
                            ? 'Subiendo…'
                            : doc.estado === 'error'
                              ? doc.errorMessage || 'Error al subir'
                              : `Cargado · id ${doc.id}`}
                        </small>
                      </span>
                      <button
                        className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-red-600 transition hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-500"
                        type="button"
                        aria-label={`Quitar ${doc.nombreOriginal}`}
                        onClick={() =>
                          onChange((prev) =>
                            prev.filter((item) => item.localId !== doc.localId),
                          )
                        }
                      >
                        <IconTrash size={18} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          )
        })}
        {error}
      </div>
    </section>
  )
}

export default DisponibilidadDocumentUpload
