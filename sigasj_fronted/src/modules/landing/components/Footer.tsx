import asadaLogo from '../../../assets/ASADA LOGO.jpeg'

import facebookLogo from '../../../assets/LogoFacebook.avif'
import whatsappLogo from '../../../assets/LogoWhatsApp.png'
import { usePublicContact } from '../../contacto/hooks/usePublicContact'
import {
  gmailComposeHref,
  telHrefFromPhone,
  whatsappHrefFromPhone,
} from '../../contacto/types/contacto.types'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { contacto } = usePublicContact()
  const facebookUrl =
    contacto.urlFacebook ?? 'https://www.facebook.com/share/14kJoKE9tLm/'
  const whatsappUrl = whatsappHrefFromPhone(contacto.telefono)

  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__brand">
          <img src={asadaLogo} alt="Logo de la ASADA San Juan de Santa Cruz" />
          <div>
            <strong>SIGASJ</strong>
            <p>ASADA San Juan de Santa Cruz</p>
          </div>
        </div>

        <div className="footer__contact" aria-labelledby="footer-contact-title">
          <p id="footer-contact-title" className="footer__heading">
            Contacto y horario
          </p>
          <address>
            <span className="footer__region">{contacto.regionResumen}</span>
            <a className="footer__contact-line" href={telHrefFromPhone(contacto.telefono)}>
              {contacto.telefono}
            </a>
            <a
              className="footer__contact-line footer__contact-line--muted"
              href={gmailComposeHref(contacto.email)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {contacto.email}
            </a>
            <span className="footer__schedule">Horario: {contacto.horarioAtencion}</span>
            <a className="footer__contact-link" href="#contacto">
              Ver mapa y detalles
            </a>
          </address>
        </div>

        <div className="footer__social" aria-labelledby="footer-social-title">
          <p id="footer-social-title" className="footer__heading">
            Redes y mensajería
          </p>
          <div className="footer__social-links">
            <a
              className="footer__social-pill footer__social-pill--facebook"
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={facebookLogo} alt="" aria-hidden="true" />
              Facebook
            </a>
            <a
              className="footer__social-pill footer__social-pill--whatsapp"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={whatsappLogo} alt="" aria-hidden="true" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {currentYear} ASADA San Juan de Santa Cruz. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer
