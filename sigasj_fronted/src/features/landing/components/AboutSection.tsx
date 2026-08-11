const PENDING_INSTITUTIONAL_INFORMATION =
  'Información pendiente de confirmación por la ASADA San Juan de Santa Cruz.'

const AboutSection = () => (
  <section id="sobre-nosotros" className="about-section" aria-labelledby="sobre-nosotros-title">
    <div className="about-section__content">
      <header className="about-section__heading">
        <h2 id="sobre-nosotros-title">Sobre nosotros</h2>
      </header>

      <div className="about-section__overview">
        <p className="about-section__intro">
          ASADA San Juan de Santa Cruz es una organización comunal encargada de la gestión y
          operación del acueducto de San Juan de Santa Cruz, Guanacaste.
        </p>

        <figure className="about-section__visual">
          <div className="about-section__placeholder" role="img" aria-label="Fotografía institucional pendiente">
            <span aria-hidden="true">Fotografía institucional</span>
          </div>
          <figcaption>
            Fotografía institucional pendiente de confirmación por la ASADA San Juan de Santa
            Cruz.
          </figcaption>
        </figure>
      </div>

      <div className="about-section__grid">
        <article className="about-section__card">
          <h3>Misión</h3>
          <p>{PENDING_INSTITUTIONAL_INFORMATION}</p>
        </article>

        <article className="about-section__card">
          <h3>Visión</h3>
          <p>{PENDING_INSTITUTIONAL_INFORMATION}</p>
        </article>

        <article className="about-section__card about-section__card--history">
          <h3>Reseña histórica</h3>
          <p>{PENDING_INSTITUTIONAL_INFORMATION}</p>
        </article>
      </div>
    </div>
  </section>
)

export default AboutSection