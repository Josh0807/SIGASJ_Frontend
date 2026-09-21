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
      className="relative isolate min-h-0 overflow-hidden bg-[linear-gradient(135deg,#fbfdff_0%,#edf8ff_55%,#e4f5ff_100%)] px-6 py-14 max-[640px]:px-4 max-[640px]:py-10"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="pointer-events-none absolute -left-48 top-16 -z-10 h-[430px] w-[390px] rotate-[-18deg] rounded-[45%] bg-sky-200/35" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-44 top-24 -z-10 h-52 w-[520px] -rotate-[18deg] rounded-[50%] border-[44px] border-sky-300/20" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-28 left-1/4 -z-10 h-48 w-[760px] rotate-3 rounded-[50%] border-[46px] border-sky-300/15" aria-hidden="true" />

      <div className="mx-auto w-full max-w-[1180px]">
        <header className="max-w-[780px]">
          <p className="mb-2 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.28em] text-[#1476cf] before:h-0.5 before:w-9 before:bg-[#1476cf]">Documentación</p>
          <h2 id={`${id}-title`} className="m-0 text-[clamp(2.2rem,4vw,3rem)] font-extrabold leading-none tracking-[-0.04em] text-[#092e67]">{title}</h2>
          <p className="mb-0 mt-4 max-w-[760px] text-base leading-7 text-[#526d8c]">{description}</p>
        </header>

        {showLoading ? (
          <p data-ui="transparency-section__empty" className="mt-8 rounded-2xl bg-white/75 p-8 text-center text-[#496b78] shadow-sm" role="status">
            Cargando documentación…
          </p>
        ) : showError ? (
          <div data-ui="transparency-section__empty" className="mt-8 rounded-2xl bg-white/80 p-8 text-center text-[#496b78] shadow-sm" role="alert">
            <p>{errorMessage}</p>
            <button className="mt-3 min-h-10 cursor-pointer rounded-xl border border-[#0872d3] bg-white px-5 font-bold text-[#0872d3]" type="button" onClick={retry}>
              Reintentar
            </button>
          </div>
        ) : hasPublications ? (
          <div data-ui="transparency-section__grid" className="mt-9 grid grid-cols-1 gap-5">
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
          <div data-ui="transparency-section__empty" className="mt-8 rounded-2xl bg-white/75 py-8 text-center text-gray-500 shadow-sm" role="status">
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  )
}

export default TransparencySection
