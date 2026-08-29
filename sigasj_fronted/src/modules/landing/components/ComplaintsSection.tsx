import { Link } from 'react-router-dom'

const ComplaintsSection = () => (
  <section
    className="landing-section account-section"
    id="quejas"
    aria-labelledby="quejas-title"
  >
    <div className="account-section__content">
      <svg
        className="account-section__icon"
        viewBox="0 0 24 24"
        role="img"
        aria-label="Icono de un sobre para enviar una queja"
        focusable="false"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>

      <div className="account-section__copy">
        <p className="account-section__eyebrow">Atención al usuario</p>
        <h2 id="quejas-title">Sugerencias y Quejas</h2>
        <p>
          Envíanos tus sugerencias y quejas completando el formulario para brindarte la atención correspondiente.
        </p>
      </div>

      <div className="account-section__action">
        <Link
          className="account-section__button"
          to="/formulario-quejas"
        >
          Enviar sugerencia o queja
        </Link>
        <p className="account-section__button-note">
          Haz clic para abrir el formulario en línea y enviarnos tus sugerencias y quejas.
        </p>
      </div>
    </div>
  </section>
)

export default ComplaintsSection
