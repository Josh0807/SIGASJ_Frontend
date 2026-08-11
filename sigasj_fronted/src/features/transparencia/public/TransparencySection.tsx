import TransparencyCard from './TransparencyCard'
import type { TransparencySectionProps } from './TransparencySectionProps'
import { TRANSPARENCY_SECTION_ID } from '../../landing/config/landingAnchors'
import { usePublicTransparencia } from './usePublicTransparencia'

/**
 * Sección pública de transparencia y calidad del agua.
 * Sin `publications` en props consulta GET /api/public/transparencia.
 * Con `publications` (modo controlado) no llama al API.
 */
const TransparencySection = ({
  id = TRANSPARENCY_SECTION_ID,
  title = 'Transparencia y calidad del agua',
  description =
    'Consulta informes, documentos e imágenes oficiales sobre la gestión del servicio y la calidad del agua en la ASADA San Juan.',
  publications: publicationsProp,
  emptyMessage = 'Próximamente publicaremos documentos e informes en esta sección.',
  errorMessage = 'No fue posible cargar la documentación. Intenta de nuevo más tarde.',
}: TransparencySectionProps) => {
  const fetchFromApi = publicationsProp === undefined
  const { status, publications: fetched, retry } =
    usePublicTransparencia(fetchFromApi)

  const publications = publicationsProp ?? fetched
  const hasPublications = publications.length > 0
  const showLoading = fetchFromApi && status === 'loading'
  const showError = fetchFromApi && status === 'error'

  return (
    <section
      className="landing-section transparency-section"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="transparency-section__content">
        <header className="transparency-section__heading">
          <p className="transparency-section__eyebrow">Documentación</p>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{description}</p>
        </header>

        {showLoading ? (
          <p className="transparency-section__empty" role="status">
            Cargando documentación…
          </p>
        ) : showError ? (
          <div className="transparency-section__empty" role="alert">
            <p>{errorMessage}</p>
            <button type="button" onClick={retry}>
              Reintentar
            </button>
          </div>
        ) : hasPublications ? (
          <div className="transparency-section__grid">
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
          <p className="transparency-section__empty" role="status">
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  )
}

export default TransparencySection
