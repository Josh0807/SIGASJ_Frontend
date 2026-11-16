import {
  IconFileDownload,
  IconFiles,
  IconRefresh,
} from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  downloadFormularioDescargablePublico,
  listFormulariosDescargablesPublicos,
  toFormulariosDescargablesPublicError,
  type FormularioDescargablePublico,
} from '../../solicitudes-publicas/formularios-descargables/formulariosDescargablesPublicApi'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import FormularioDescargableCard from '../components/FormularioDescargableCard'
import PublicFormPage from '../components/PublicFormPage'

const OtherFormsPage = () => {
  const [items, setItems] = useState<FormularioDescargablePublico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [downloadErrors, setDownloadErrors] = useState<Record<number, string>>(
    {},
  )
  const downloadingRef = useRef<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await listFormulariosDescargablesPublicos())
    } catch (caught) {
      setError(toFormulariosDescargablesPublicError(caught))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => runAfterEffect(() => {
    void load()
  }), [load])

  const handleDownload = async (formulario: FormularioDescargablePublico) => {
    if (downloadingRef.current !== null) return
    downloadingRef.current = formulario.id
    setDownloadingId(formulario.id)
    setDownloadErrors((current) => {
      const next = { ...current }
      delete next[formulario.id]
      return next
    })
    try {
      await downloadFormularioDescargablePublico(
        formulario.id,
        formulario.nombreArchivoOriginal || formulario.nombre,
      )
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : 'No fue posible descargar el formulario. Intenta nuevamente.'
      setDownloadErrors((current) => ({
        ...current,
        [formulario.id]: message,
      }))
      if (message.includes('no está disponible') || message.includes('404')) {
        void load()
      }
    } finally {
      downloadingRef.current = null
      setDownloadingId(null)
    }
  }

  return (
    <PublicFormPage
      returnTo="/#solicitudes-servicio"
      eyebrow="Documentos públicos"
      title="Formularios descargables"
      description="Consulte y descargue formularios adicionales publicados por la ASADA. Estos documentos no se completan en línea ni inician un trámite digital."
      ariaLabel="Otros formularios descargables"
      titleId="other-forms-title"
      icon={<IconFileDownload size={36} aria-hidden="true" />}
      maxWidth="xl"
    >
      {loading ? (
        <p
          className="rounded-[16px] border border-sigasj-border bg-sigasj-surface px-8 py-10 text-center font-semibold text-sigasj-muted shadow-[0_4px_14px_rgba(16,43,56,0.05)]"
          role="status"
        >
          Cargando formularios disponibles…
        </p>
      ) : error ? (
        <div
          className="rounded-[16px] border border-sigasj-error/30 bg-red-50 px-8 py-8 text-center max-[640px]:px-5"
          role="alert"
        >
          <p className="m-0 font-semibold text-sigasj-error">{error}</p>
          <button
            className="transparency-motion-button mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-sigasj-error/40 bg-sigasj-surface px-5 font-semibold text-sigasj-error"
            type="button"
            onClick={() => void load()}
          >
            <IconRefresh size={18} aria-hidden="true" /> Reintentar
          </button>
        </div>
      ) : items.length === 0 ? (
        <section
          className="transparency-motion-card rounded-[16px] border border-sigasj-border bg-sigasj-surface px-8 py-10 text-center shadow-[0_4px_14px_rgba(16,43,56,0.05)] max-[640px]:px-5"
          aria-label="Formularios disponibles"
        >
          <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-sigasj-border bg-sigasj-surface-soft text-sigasj-primary">
            <IconFiles size={36} aria-hidden="true" />
          </span>
          <h2 className="public-section-title mt-5 !text-2xl">
            Formularios descargables
          </h2>
          <p
            className="public-section-intro mx-auto mb-0 mt-3 max-w-[600px]"
            role="status"
          >
            No hay formularios adicionales disponibles en este momento.
          </p>
          <p className="mx-auto mb-0 mt-4 flex w-fit items-center gap-2 text-sm font-semibold text-sigasj-muted">
            <IconFileDownload size={20} aria-hidden="true" /> Los nuevos
            documentos aparecerán aquí cuando sean publicados.
          </p>
        </section>
      ) : (
        <section
          className="grid grid-cols-2 gap-5 max-[820px]:grid-cols-1"
          aria-label="Formularios disponibles"
        >
          {items.map((formulario) => (
            <FormularioDescargableCard
              key={formulario.id}
              formulario={formulario}
              downloading={downloadingId === formulario.id}
              downloadError={downloadErrors[formulario.id] ?? null}
              onDownload={(item) => {
                void handleDownload(item)
              }}
            />
          ))}
        </section>
      )}
    </PublicFormPage>
  )
}

export default OtherFormsPage
