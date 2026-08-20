const COMPLAINTS_EMAIL = 'jdasadasanjuan@gmail.com'
const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
  COMPLAINTS_EMAIL,
)}&su=${encodeURIComponent('Queja para ASADA San Juan')}`

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
        <p className="landing-eyebrow">Atención al usuario</p>
        <h2 id="quejas-title">Sugerencias y quejas</h2>
        <p className="landing-section__lead">
          Envíanos tus sugerencias y quejas por correo electrónico para que podamos conocerlas y brindarles la
          atención correspondiente.
        </p>
      </div>

      <div className="account-section__action">
        <a
          className="account-section__button"
          href={GMAIL_COMPOSE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {COMPLAINTS_EMAIL}
        </a>
        <p className="account-section__button-note">
          Haz clic en el correo electrónico para abrir Gmail y enviarnos tus sugerencias y quejas .
        </p>
      </div>
    </div>
  </section>
)

export default ComplaintsSection
