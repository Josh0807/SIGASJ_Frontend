import asadaPhoto from '../../../assets/FOTOASADA.webp'

const HISTORY = `La Asociación Administradora del Sistema de Acueducto y Alcantarillado Sanitario (ASADA) de San Juan de Santa Cruz, Guanacaste, tiene sus orígenes en el año 2003, cuando el 24 de septiembre, un grupo de 53 vecinos fundadores se reunió en el salón comunal con el propósito de constituir una organización encargada de administrar, operar y proteger el sistema de abastecimiento de agua potable de la comunidad.

El acueducto que abastece a la comunidad había sido construido en 1977, respondiendo a las necesidades de la población de aquella época. Con el paso de los años, el crecimiento poblacional y el aumento en la demanda del servicio hicieron necesaria una administración comunal organizada que garantizara el acceso al agua potable y el mantenimiento de la infraestructura.

Desde su creación, la ASADA San Juan ha trabajado en el mejoramiento continuo del servicio, velando por la conservación de las fuentes de agua, el mantenimiento de la red de distribución y la promoción del uso responsable del recurso hídrico. Gracias al esfuerzo conjunto de sus juntas directivas, personal administrativo, fontaneros y usuarios, la asociación se ha consolidado como una organización comprometida con el bienestar y el desarrollo de la comunidad.

En la actualidad, la ASADA continúa enfrentando el reto de modernizar y ampliar su infraestructura para responder al crecimiento de la población y garantizar un servicio de agua potable eficiente, seguro y sostenible para las generaciones presentes y futuras.`

const AboutSection = () => (
  <section
    id="sobre-nosotros"
    className="public-section bg-white"
    aria-labelledby="sobre-nosotros-title"
  >
    <div className="public-container">
      <header className="mx-auto max-w-[720px] text-center">
        <h2 id="sobre-nosotros-title" className="public-section-title">
          Sobre la ASADA
        </h2>
        <p className="mx-auto mb-0 mt-5 max-w-[36rem] text-pretty text-[1.05rem] leading-[1.7] text-sigasj-muted">
          Somos la asociación administradora del acueducto de San Juan de Santa
          Cruz. Nuestro compromiso es un servicio de agua potable cercano,
          transparente y sostenible para la comunidad.
        </p>
      </header>

      <figure className="mx-auto mt-10 max-w-[860px]">
        <div className="overflow-hidden rounded-[4px]">
          <img
            className="aspect-[16/9] h-auto w-full object-cover"
            src={asadaPhoto}
            alt="Instalaciones de la ASADA San Juan"
            loading="lazy"
            decoding="async"
          />
        </div>
        <figcaption className="mt-3 text-center text-[0.8rem] leading-5 tracking-[0.01em] text-sigasj-muted">
          Instalaciones de la ASADA San Juan · Santa Cruz, Guanacaste
        </figcaption>
      </figure>

      <div className="mt-14 grid grid-cols-2 gap-x-12 gap-y-10 max-[720px]:grid-cols-1">
        <article className="min-w-0 text-center">
          <h3 className="m-0 font-sigasj-display text-[0.78rem] font-bold uppercase tracking-[0.18em] text-sigasj-primary">
            Visión
          </h3>
          <p className="mx-auto mb-0 mt-4 max-w-[34rem] text-center text-pretty text-[0.98rem] leading-[1.7] text-sigasj-text">
            Ser una ASADA líder y reconocida por la excelencia en la gestión del
            agua, la protección del recurso hídrico, la innovación, la
            transparencia y el compromiso con el desarrollo sostenible de la
            comunidad y las futuras generaciones.
          </p>
        </article>

        <article className="min-w-0 text-center">
          <h3 className="m-0 font-sigasj-display text-[0.78rem] font-bold uppercase tracking-[0.18em] text-sigasj-primary">
            Misión
          </h3>
          <p className="mx-auto mb-0 mt-4 max-w-[34rem] text-center text-pretty text-[0.98rem] leading-[1.7] text-sigasj-text">
            Brindar un servicio de agua potable de calidad a la comunidad de San
            Juan de Santa Cruz, administrando el recurso hídrico de manera
            eficiente, transparente y sostenible, promoviendo su uso responsable
            y contribuyendo al bienestar de todos los usuarios.
          </p>
        </article>
      </div>

      <details className="group mx-auto mt-14 w-full max-w-[42rem] open:pb-1">
        <summary className="flex w-full cursor-pointer list-none flex-col items-center justify-center gap-3 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sigasj-primary [&::-webkit-details-marker]:hidden">
          <span
            className="block w-full text-center font-sigasj-display text-[clamp(2.75rem,7vw,4.25rem)] font-extrabold leading-none tracking-[-0.04em] text-sigasj-ink"
            aria-hidden="true"
          >
            2003
          </span>
          <span className="flex w-full min-w-0 flex-col items-center gap-1.5 text-center">
            <strong className="font-sigasj-display text-xl font-bold tracking-[-0.02em] text-sigasj-text">
              Reseña histórica
            </strong>
            <span className="text-sm leading-6 text-sigasj-muted">
              Origen y evolución de la ASADA · Pulse para leer
            </span>
          </span>
          <span
            className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-sigasj-border text-sigasj-primary transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-45"
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
        </summary>
        <div className="mx-auto mt-8 max-w-[68ch] space-y-4 text-center text-[0.95rem] leading-[1.75] text-sigasj-muted">
          {HISTORY.split('\n\n').map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="m-0 text-center text-pretty">
              {paragraph}
            </p>
          ))}
        </div>
      </details>
    </div>
  </section>
)

export default AboutSection
