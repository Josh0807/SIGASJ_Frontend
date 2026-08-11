import { Link } from 'react-router-dom'
import type { AccountSectionProps } from '../Props/AccountSectionProps'

const AccountSection = ({ formHref = '/reportar-averia' }: AccountSectionProps) => (
  <section
    className="landing-section account-section"
    id="reporte-averias"
    aria-labelledby="reporte-averias-title"
  >
    <div className="account-section__content">
      <svg
        className="account-section__icon"
        viewBox="0 0 24 24"
        role="img"
        aria-label="Ícono de una tubería con una fuga de agua"
        focusable="false"
      >
        <path d="M4 5h6v4H7v4h6V9h4v4" />
        <path d="M17 13h3v3" />
        <path d="M18.5 17.5c0 0-2 2.3-2 3.5a2 2 0 0 0 4 0c0-1.2-2-3.5-2-3.5Z" />
      </svg>

      <div className="account-section__copy">
        <p className="account-section__eyebrow">Atención de averías</p>
        <h2 id="reporte-averias-title">Reportar una avería</h2>
        <p>
          Infórmanos sobre fugas, daños u otras averías en el servicio de agua para que podamos
          atenderlas oportunamente.
        </p>
      </div>

      <Link className="account-section__button" to={formHref}>
        Reportar avería
      </Link>
    </div>
  </section>
)

export default AccountSection
