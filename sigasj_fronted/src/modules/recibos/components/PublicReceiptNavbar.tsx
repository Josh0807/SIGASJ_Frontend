import { Link } from 'react-router-dom'
import asadaLogo from '../../../assets/ASADA LOGO.jpeg'

export const PublicReceiptNavbar = () => {
  return (
    <header className="header public-receipt-navbar" aria-label="Navegación pública de recibos">
      <div className="header__inner">
        <Link className="brand" to="/" aria-label="SIGASJ San Juan, ir al inicio">
          <span className="brand__logo">
            <img src={asadaLogo} alt="Logo oficial de la ASADA San Juan de Santa Cruz" />
          </span>
          <span className="brand__text">
            <strong>SIGASJ</strong>
            <span>ASADA San Juan de Santa Cruz</span>

          </span>
        </Link>

        <nav className="navbar" aria-label="Navegación de retorno">
          <ul className="navbar__list">
            <li>
              <Link className="navbar__link navbar__link--home" to="/">
                Inicio
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default PublicReceiptNavbar
