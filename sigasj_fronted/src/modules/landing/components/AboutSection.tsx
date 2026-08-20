import type { ReactNode } from 'react'
import asadaPhoto from '../../../assets/FOTOASADA.png'

type TimelineEvent = {
  year: string
  title: string
  description: string
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: '1977',
    title: 'Construcción del acueducto',
    description:
      'Se construye la infraestructura que abastece a la comunidad, respondiendo a las necesidades de la población de aquella época.',
  },
  {
    year: '2003',
    title: 'Fundación de la ASADA',
    description:
      'El 24 de septiembre, 53 vecinos fundadores se reunieron en el salón comunal para constituir la organización encargada de administrar, operar y proteger el sistema de agua potable.',
  },
  {
    year: 'Hoy',
    title: 'Compromiso con la comunidad',
    description:
      'Juntas directivas, personal administrativo, fontaneros y usuarios consolidan un servicio orientado al bienestar, la conservación de fuentes y el uso responsable del agua.',
  },
]

const PillarIcon = ({ children }: { children: ReactNode }) => (
  <span className="about-section__pillar-icon" aria-hidden="true">
    {children}
  </span>
)

const AboutSection = () => (
  <section id="sobre-nosotros" className="about-section" aria-labelledby="sobre-nosotros-title">
    <div className="about-section__content">
      <div className="about-section__overview">
        <header className="about-section__heading">
          <p className="about-section__eyebrow">Nuestra identidad</p>
          <h2 id="sobre-nosotros-title">Sobre nosotros</h2>
          <p className="about-section__intro">
            ASADA San Juan de Santa Cruz es una organización comunal encargada de la gestión y
            operación del acueducto de San Juan de Santa Cruz, Guanacaste.
          </p>
        </header>

        <figure className="about-section__visual">
          <img
            className="about-section__image"
            src={asadaPhoto}
            alt="Instalaciones de la ASADA San Juan"
          />
          <figcaption className="about-section__caption">
            Infraestructura y servicio comunal al servicio de San Juan de Santa Cruz.
          </figcaption>
        </figure>
      </div>

      <div className="about-section__pillars" aria-label="Visión y misión institucional">
        <article className="about-section__pillar about-section__pillar--vision">
          <PillarIcon>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
              <path
                d="M2.5 12s3.6-6.5 9.5-6.5S21.5 12 21.5 12 17.9 18.5 12 18.5 2.5 12 2.5 12Z"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          </PillarIcon>
          <p className="about-section__pillar-label">Visión</p>
          <blockquote className="about-section__pillar-quote">
            Ser una ASADA líder y reconocida por la excelencia en la gestión del agua, la protección
            del recurso hídrico, la innovación, la transparencia y el compromiso con el desarrollo
            sostenible de la comunidad y las futuras generaciones.
          </blockquote>
        </article>

        <article className="about-section__pillar about-section__pillar--mission">
          <PillarIcon>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
              <path
                d="M12 3.5c.4 0 5.8 7.2 5.8 11.2A5.8 5.8 0 0 1 12 20.5a5.8 5.8 0 0 1-5.8-5.8C6.2 10.7 11.6 3.5 12 3.5Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
          </PillarIcon>
          <p className="about-section__pillar-label">Misión</p>
          <blockquote className="about-section__pillar-quote">
            Brindar un servicio de agua potable de calidad a la comunidad de San Juan de Santa
            Cruz, administrando el recurso hídrico de manera eficiente, transparente y sostenible,
            promoviendo su uso responsable y contribuyendo al bienestar de todos los usuarios.
          </blockquote>
        </article>
      </div>

      <div className="about-section__history">
        <header className="about-section__history-header">
          <p className="about-section__eyebrow">Nuestra trayectoria</p>
          <h3>Reseña histórica</h3>
          <p className="about-section__history-lead">
            Más de cuatro décadas de servicio comunitario, desde la infraestructura original hasta
            una administración organizada al servicio de la comunidad.
          </p>
        </header>

        <div className="about-section__history-body">
          <ol className="about-section__timeline" aria-label="Hitos históricos de la ASADA">
            {TIMELINE_EVENTS.map((event) => (
              <li key={event.year} className="about-section__timeline-item">
                <div className="about-section__timeline-marker" aria-hidden="true">
                  <span className="about-section__timeline-year">{event.year}</span>
                </div>
                <div className="about-section__timeline-body">
                  <h4>{event.title}</h4>
                  <p>{event.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <aside className="about-section__highlight" aria-label="Dato histórico destacado">
            <p className="about-section__highlight-eyebrow">Acta fundacional</p>
            <p className="about-section__highlight-number">53</p>
            <p className="about-section__highlight-title">vecinos fundadores</p>
            <p className="about-section__highlight-meta">24 de septiembre · 2003</p>
          </aside>
        </div>

        <p className="about-section__history-closing">
          En la actualidad, la ASADA continúa modernizando y ampliando su infraestructura para
          responder al crecimiento de la población y garantizar un servicio de agua potable
          eficiente, seguro y sostenible para las generaciones presentes y futuras.
        </p>
      </div>
    </div>
  </section>
)

export default AboutSection
