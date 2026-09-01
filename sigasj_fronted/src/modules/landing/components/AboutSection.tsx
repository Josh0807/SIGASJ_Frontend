import type { ReactNode } from 'react'
import asadaPhoto from '../../../assets/FOTOASADA.png'

const AboutIcon = ({ children }: { children: ReactNode }) => (
  <span className="about-section__icon" aria-hidden="true">
    {children}
  </span>
)

const AboutSection = () => (
  <section
    id="sobre-nosotros"
    className="landing-section about-section"
    aria-labelledby="sobre-nosotros-title"
  >
    <div className="about-section__content">
      <header className="about-section__heading">
        <p className="about-section__eyebrow">Nuestra identidad</p>
        <h2 id="sobre-nosotros-title">Sobre nosotros</h2>
      </header>

      <div className="about-section__body">
        <figure className="about-section__visual">
          <img
            className="about-section__image"
            src={asadaPhoto}
            alt="Instalaciones de la ASADA San Juan"
          />
        </figure>

        <div className="about-section__grid">
        <article className="about-section__card about-section__card--compact">
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
          <p>Ser una ASADA líder y reconocida por la excelencia en la gestión del agua, la protección del recurso hídrico, la innovación, la transparencia y el compromiso con el desarrollo sostenible de la comunidad y las futuras generaciones.</p>
        </article>

        <article className="about-section__card about-section__card--compact">
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
          <p>Brindar un servicio de agua potable de calidad a la comunidad de San Juan de Santa Cruz, administrando el recurso hídrico de manera eficiente, transparente y sostenible, promoviendo su uso responsable y contribuyendo al bienestar de todos los usuarios.</p>
        </article>

        </div>
      </div>

      <details className="about-section__history">
        <summary>
          <span>
            <strong>Reseña histórica</strong>
            <small>Conozca el origen y la evolución de nuestra ASADA</small>
          </span>
          <span className="about-section__history-action">Leer más</span>
        </summary>
        <div className="about-section__history-content">
          <p>La Asociación Administradora del Sistema de Acueducto y Alcantarillado Sanitario (ASADA) de San Juan de Santa Cruz, Guanacaste, tiene sus orígenes en el año 2003, cuando el 24 de septiembre, un grupo de 53 vecinos fundadores se reunió en el salón comunal con el propósito de constituir una organización encargada de administrar, operar y proteger el sistema de abastecimiento de agua potable de la comunidad. 
El acueducto que abastece a la comunidad había sido construido en 1977, respondiendo a las necesidades de la población de aquella época. Con el paso de los años, el crecimiento poblacional y el aumento en la demanda del servicio hicieron necesaria una administración comunal organizada que garantizara el acceso al agua potable y el mantenimiento de la infraestructura. 
Desde su creación, la ASADA San Juan ha trabajado en el mejoramiento continuo del servicio, velando por la conservación de las fuentes de agua, el mantenimiento de la red de distribución y la promoción del uso responsable del recurso hídrico. Gracias al esfuerzo conjunto de sus juntas directivas, personal administrativo, fontaneros y usuarios, la asociación se ha consolidado como una organización comprometida con el bienestar y el desarrollo de la comunidad.
En la actualidad, la ASADA continúa enfrentando el reto de modernizar y ampliar su infraestructura para responder al crecimiento de la población y garantizar un servicio de agua potable eficiente, seguro y sostenible para las generaciones presentes y futuras.
</p>
        </div>
      </details>
    </div>
  </section>
)

export default AboutSection
