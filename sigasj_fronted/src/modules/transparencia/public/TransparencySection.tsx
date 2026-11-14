import TransparencyCard from './TransparencyCard'
import type { TransparencySectionProps } from './TransparencySectionProps'
import { TRANSPARENCY_SECTION_ID } from '../../landing/config/landingAnchors'
import { usePublicTransparencia } from './usePublicTransparencia'

/**
 * Sección pública de transparencia y calidad del agua.
 * Sin `publications` en props usa la colección de ejemplo.
 * Con `publications` (modo controlado) muestra exactamente esos datos.
 */
const TransparencySection = ({
  id = TRANSPARENCY_SECTION_ID,
  title = 'Transparencia',
  description =
    'Consulta informes, documentos e imágenes oficiales sobre la gestión del servicio y la calidad del agua en la ASADA San Juan.',
  publications: publicationsProp,
  emptyMessage = 'No hay documentos de transparencia publicados por el momento.',
  errorMessage = 'No fue posible cargar la documentación. Intenta de nuevo más tarde.',
}: TransparencySectionProps) => {
  const useDefaultItems = publicationsProp === undefined
  const { status, publications: fetched, retry } =
    usePublicTransparencia(useDefaultItems)

  const publications = publicationsProp ?? fetched
  const hasPublications = publications.length > 0
  const showLoading = useDefaultItems && status === 'loading'
  const showError = useDefaultItems && status === 'error'

  return (
    <section
      className="public-section public-section--surface"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="public-container">
        <header className="max-w-[720px]">
          <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-sigasj-primary">Documentación</p>
          <h2 id={`${id}-title`} className="m-0 font-sigasj-display text-[clamp(1.7rem,3.2vw,2.5rem)] font-bold leading-[1.15] tracking-[-0.02em] text-sigasj-text">{title}</h2>
          <p className="mb-0 mt-4 max-w-[720px] text-base leading-[1.65] text-sigasj-muted">{description}</p>
        </header>

        {showLoading ? (
          <p data-ui="transparency-section__empty" className="mt-8 rounded-[13px] border border-sigasj-border bg-sigasj-canvas p-8 text-center text-sigasj-muted" role="status">
            Cargando documentación…
          </p>
        ) : showError ? (
          <div data-ui="transparency-section__empty" className="mt-8 rounded-[13px] border border-sigasj-border bg-sigasj-canvas p-8 text-center text-sigasj-muted" role="alert">
            <p>{errorMessage}</p>
            <button className="mt-3 min-h-11 cursor-pointer rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-5 font-semibold text-sigasj-primary-hover" type="button" onClick={retry}>
              Reintentar
            </button>
          </div>
        ) : hasPublications ? (
          <div data-ui="transparency-section__grid" className="mt-8 grid grid-cols-1 gap-4">
            {publications.map((publication) => (
              <TransparencyCard
                key={publication.id}
                id={publication.id}
                name={publication.name}
                description={publication.description}
                fileUrl={publication.fileUrl}
                fileType={publication.fileType}
              />
            ))}
          </div>
        ) : (
          <div data-ui="transparency-section__empty" className="mt-8 rounded-[13px] border border-sigasj-border bg-sigasj-canvas py-8 text-center text-sigasj-muted" role="status">
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  )
}

export default TransparencySection
