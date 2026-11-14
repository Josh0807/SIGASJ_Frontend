import { useEffect, useId, useState } from 'react'
import asadaPhoto from '../../../assets/FOTOASADA.webp'

const HISTORY = `La Asociación Administradora del Sistema de Acueducto y Alcantarillado Sanitario (ASADA) de San Juan de Santa Cruz, Guanacaste, tiene sus orígenes en el año 2003, cuando el 24 de septiembre, un grupo de 53 vecinos fundadores se reunió en el salón comunal con el propósito de constituir una organización encargada de administrar, operar y proteger el sistema de abastecimiento de agua potable de la comunidad.

El acueducto que abastece a la comunidad había sido construido en 1977, respondiendo a las necesidades de la población de aquella época. Con el paso de los años, el crecimiento poblacional y el aumento en la demanda del servicio hicieron necesaria una administración comunal organizada que garantizara el acceso al agua potable y el mantenimiento de la infraestructura.

Desde su creación, la ASADA San Juan ha trabajado en el mejoramiento continuo del servicio, velando por la conservación de las fuentes de agua, el mantenimiento de la red de distribución y la promoción del uso responsable del recurso hídrico. Gracias al esfuerzo conjunto de sus juntas directivas, personal administrativo, fontaneros y usuarios, la asociación se ha consolidado como una organización comprometida con el bienestar y el desarrollo de la comunidad.

En la actualidad, la ASADA continúa enfrentando el reto de modernizar y ampliar su infraestructura para responder al crecimiento de la población y garantizar un servicio de agua potable eficiente, seguro y sostenible para las generaciones presentes y futuras.`

const HISTORY_PARAGRAPHS = HISTORY.split('\n\n')

const AboutSection = () => {
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return (
    <section
      id="sobre-nosotros"
      className="public-section bg-white"
      aria-labelledby="sobre-nosotros-title"
    >
      <div className="public-container">
        <header className="mx-auto max-w-[720px] text-center" data-aos="fade-up">
          <h2 id="sobre-nosotros-title" className="public-section-title">
            Sobre la ASADA
          </h2>
          <p className="public-section-intro mx-auto">
            Somos la asociación administradora del acueducto de San Juan de Santa
            Cruz. Nuestro compromiso es un servicio de agua potable cercano,
            transparente y sostenible para la comunidad.
          </p>
        </header>

        <figure
          className="mx-auto mt-10 max-w-[860px]"
          data-aos="fade-up"
          data-aos-delay="80"
        >
          <div className="overflow-hidden rounded-2xl">
            <img
              className="aspect-[16/9] h-auto w-full object-cover"
              src={asadaPhoto}
              alt="Instalaciones de la ASADA San Juan"
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption className="public-caption mt-3 text-center">
            Instalaciones de la ASADA San Juan · Santa Cruz, Guanacaste
          </figcaption>
        </figure>

        <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 max-[720px]:grid-cols-1">
          <article className="min-w-0 text-center" data-aos="fade-up" data-aos-delay="40">
            <h3 className="public-card-title text-[clamp(1.65rem,3vw,2.15rem)] leading-tight tracking-[-0.03em]">
              Visión
            </h3>
            <p className="public-prose mx-auto mt-4 max-w-[34rem] text-center">
              Ser una ASADA líder y reconocida por la excelencia en la gestión del
              agua, la protección del recurso hídrico, la innovación, la
              transparencia y el compromiso con el desarrollo sostenible de la
              comunidad y las futuras generaciones.
            </p>
          </article>

          <article className="min-w-0 text-center" data-aos="fade-up" data-aos-delay="120">
            <h3 className="public-card-title text-[clamp(1.65rem,3vw,2.15rem)] leading-tight tracking-[-0.03em]">
              Misión
            </h3>
            <p className="public-prose mx-auto mt-4 max-w-[34rem] text-center">
              Brindar un servicio de agua potable de calidad a la comunidad de San
              Juan de Santa Cruz, administrando el recurso hídrico de manera
              eficiente, transparente y sostenible, promoviendo su uso responsable
              y contribuyendo al bienestar de todos los usuarios.
            </p>
          </article>
        </div>

        <div
          className="about-history mx-auto mt-14 w-full max-w-[42rem]"
          data-aos="fade-up"
          data-aos-delay="60"
        >
          <button
            type="button"
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 border-0 bg-transparent p-0 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sigasj-primary"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            <strong className="public-section-title block w-full text-center text-[clamp(1.85rem,4vw,2.75rem)]">
              Reseña histórica
            </strong>
            <span className="flex w-full min-w-0 flex-col items-center gap-1.5 text-center">
              <span className="public-card-title text-[1.5rem] tracking-tight">2003</span>
              <span className="public-card-text">
                Origen y evolución de la ASADA · Pulse para {open ? 'cerrar' : 'leer'}
              </span>
            </span>
            <span
              className={`mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-sigasj-border text-sigasj-primary transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]${
                open ? ' rotate-45' : ''
              }`}
              aria-hidden="true"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1v12M1 7h12"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>

          <div
            id={panelId}
            className={`about-history__panel${open ? ' about-history__panel--open' : ''}${
              reducedMotion ? ' about-history__panel--reduced' : ''
            }`}
            role="region"
            aria-label="Texto de la reseña histórica"
            aria-hidden={!open}
          >
            <div className="about-history__panel-inner">
              <div className="mx-auto max-w-[68ch] space-y-4 pt-8 text-center">
                {HISTORY_PARAGRAPHS.map((paragraph, index) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="about-history__paragraph public-prose mx-auto text-center text-sigasj-text"
                    style={
                      reducedMotion
                        ? undefined
                        : { transitionDelay: open ? `${80 + index * 70}ms` : '0ms' }
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
