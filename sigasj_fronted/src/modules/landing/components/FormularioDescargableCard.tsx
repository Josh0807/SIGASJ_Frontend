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
  <article className="transparency-motion-card flex min-w-0 flex-col rounded-[16px] border border-sigasj-border bg-sigasj-surface p-6 shadow-[0_4px_14px_rgba(16,43,56,0.05)] max-[640px]:p-5">
    <h2 className="m-0 font-sigasj-display text-xl font-bold leading-tight tracking-[-0.02em] text-sigasj-ink">
      {formulario.nombre}
    </h2>
    <p className="mb-0 mt-3 text-sm leading-6 text-sigasj-muted">
      {formulario.descripcion?.trim()
        ? formulario.descripcion
        : 'Documento publicado por la ASADA para descarga.'}
    </p>
    <div className="mt-6 flex flex-col gap-2">
      <button
        className="landing-lift-button landing-lift-button--solid inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-sigasj-primary bg-sigasj-primary px-5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
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
          className="m-0 rounded-[12px] border border-sigasj-error/30 bg-red-50 px-3 py-2 text-sm font-semibold text-sigasj-error"
          role="alert"
        >
          {downloadError}
        </p>
      ) : null}
    </div>
  </article>
)

export default FormularioDescargableCard
