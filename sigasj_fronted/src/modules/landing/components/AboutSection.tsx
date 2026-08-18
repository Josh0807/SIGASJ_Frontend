import type { ReactNode } from 'react'

const PENDING_INSTITUTIONAL_INFORMATION =
  'Información pendiente de confirmación por la ASADA San Juan de Santa Cruz.'

const AboutIcon = ({ children }: { children: ReactNode }) => (
  <span className="about-section__icon" aria-hidden="true">
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
          <div
            className="about-section__placeholder"
            role="img"
            aria-label="Fotografía institucional pendiente"
          >
            <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
              <path
                fill="currentColor"
                d="M32 8c.6 0 8.2 10.4 13.2 20.2C50.4 38.2 48 52 32 52S13.6 38.2 18.8 28.2C23.8 18.4 31.4 8 32 8Z"
                opacity=".92"
              />
              <path
                fill="#fff"
                d="M24.5 34.5c2.4-6.2 5.6-11.8 7.5-15.2 1.9 3.4 5.1 9 7.5 15.2-1.8 5.2-5 8.3-7.5 8.3s-5.7-3.1-7.5-8.3Z"
                opacity=".35"
              />
            </svg>
            <span>Fotografía institucional</span>
          </div>
          <figcaption>
            Fotografía institucional pendiente de confirmación por la ASADA San Juan de Santa Cruz.
          </figcaption>
        </figure>
      </div>

      <div className="about-section__grid">
        <article className="about-section__card">
          <AboutIcon>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
              <path
                d="M2.5 12s3.6-6.5 9.5-6.5S21.5 12 21.5 12 17.9 18.5 12 18.5 2.5 12 2.5 12Z"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          </AboutIcon>
          <h3>Visión</h3>
          <p>{PENDING_INSTITUTIONAL_INFORMATION}</p>
        </article>

        <article className="about-section__card">
          <AboutIcon>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
              <path
                d="M12 3.5c.4 0 5.8 7.2 5.8 11.2A5.8 5.8 0 0 1 12 20.5a5.8 5.8 0 0 1-5.8-5.8C6.2 10.7 11.6 3.5 12 3.5Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
          </AboutIcon>
          <h3>Misión</h3>
          <p>{PENDING_INSTITUTIONAL_INFORMATION}</p>
        </article>

        <article className="about-section__card">
          <AboutIcon>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
              <path
                d="M5 5.5h11.5A2.5 2.5 0 0 1 19 8v11.5H7.5A2.5 2.5 0 0 0 5 21.5V5.5Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19" stroke="currentColor" strokeWidth="1.7" />
              <path d="M9 10h6.5M9 14h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </AboutIcon>
          <h3>Reseña histórica</h3>
          <p>{PENDING_INSTITUTIONAL_INFORMATION}</p>
        </article>
      </div>
    </div>
  </section>
)

export default AboutSection
