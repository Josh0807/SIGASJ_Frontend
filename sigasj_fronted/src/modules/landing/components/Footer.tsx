import asadaLogo from '../../../assets/ASADA LOGO.jpeg'

import facebookLogo from '../../../assets/LogoFacebook.avif'
import whatsappLogo from '../../../assets/LogoWhatsApp.png'

const Footer = () => {
  const currentYear = new Date().getFullYear()

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

        <div className="footer__contact">
          <h2>Contacto y Horario</h2>
          <address>
            <span>San Juan de Santa Cruz, Guanacaste</span>
            <span>Horario: Lunes a sábado de 7:30 a.m. – 11:30 a.m.</span>
            <a href="#contacto">Ver información de contacto</a>
          </address>
        </div>

        <div className="footer__social">
          <h2>Redes sociales</h2>
          <a
            href="https://www.facebook.com/share/14kJoKE9tLm/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={facebookLogo} alt="" aria-hidden="true" />
            Facebook
          </a>
          <a
            href="https://wa.me/50685607584"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={whatsappLogo} alt="" aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {currentYear} ASADA San Juan de Santa Cruz. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer
