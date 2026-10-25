import { IconDownload } from '@tabler/icons-react'
import type { FormularioDescargablePublico } from '../../solicitudes-publicas/formularios-descargables/formulariosDescargablesPublicApi'

type Props = {
  formulario: FormularioDescargablePublico
  downloading: boolean
  downloadError: string | null
  onDownload: (formulario: FormularioDescargablePublico) => void
}

const FormularioDescargableCard = ({
  formulario,
  downloading,
  downloadError,
  onDownload,
}: Props) => (
  <article className="flex min-w-0 flex-col rounded-[22px] border border-sky-100 bg-white p-6 shadow-[0_12px_28px_rgba(39,112,166,0.1)] max-[640px]:p-5">
    <h2 className="m-0 text-xl font-extrabold leading-tight tracking-[-0.02em] text-[#073b79]">
      {formulario.nombre}
    </h2>
    <p className="mb-0 mt-3 text-sm leading-6 text-[#526d8c]">
      {formulario.descripcion?.trim()
        ? formulario.descripcion
        : 'Documento publicado por la ASADA para descarga.'}
    </p>
    <div className="mt-6 flex flex-col gap-2">
      <button
        className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl !border-0 bg-gradient-to-r from-[#0872d3] to-[#3298dc] px-5 text-sm font-extrabold text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 motion-reduce:transform-none"
        type="button"
        disabled={downloading}
        aria-label={`Descargar ${formulario.nombre}`}
        onClick={() => onDownload(formulario)}
      >
        <IconDownload size={19} aria-hidden="true" />
        {downloading ? 'Descargando…' : 'Descargar'}
      </button>
      {downloadError ? (
        <p
          className="m-0 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800"
          role="alert"
        >
          {downloadError}
        </p>
      ) : null}
    </div>
  </article>
)

export default FormularioDescargableCard
