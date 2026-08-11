import asadaLogo from '../../../assets/ASADA LOGO.jpeg'

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
          <h2>Contacto</h2>
          <address>
            <span>San Juan de Santa Cruz, Guanacaste</span>
            <a href="#contacto">Ver información de contacto</a>
          </address>
        </div>

        <div className="footer__links">
          <h2>Enlaces</h2>
          <a href="#inicio">Volver al inicio</a>
          <a href="/login">Iniciar sesión</a>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {currentYear} ASADA San Juan de Santa Cruz. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer
