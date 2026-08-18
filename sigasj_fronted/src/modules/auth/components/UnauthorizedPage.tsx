import { Link } from 'react-router-dom'
import asadaLogo from '../../../assets/ASADA LOGO.jpeg'
import {
  LANDING_ROUTE_PATH,
  LOGIN_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { getDefaultAdminHomePath } from '../utils/adminNavigation'
import { useAuth } from './AuthContext'

const AuthPageBrand = () => (
  <div className="auth-page__brand">
    <span className="auth-page__brand-logo">
      <img src={asadaLogo} alt="" />
    </span>
    <span className="auth-page__brand-text">
      <strong>SIGASJ</strong>
      <span>ASADA San Juan</span>
    </span>
  </div>
)

const UnauthorizedPage = () => {
  const { isAuthenticated, user } = useAuth()
  const homePath = getDefaultAdminHomePath(user)

  const hint = isAuthenticated
    ? 'Tu cuenta no tiene permiso para acceder a esta función del panel administrativo. Si crees que se trata de un error, contacta a la administración de la ASADA.'
    : 'Debes iniciar sesión para acceder a esta sección.'

  const primaryAction = isAuthenticated
    ? homePath
      ? { to: homePath, label: 'Volver al panel' }
      : null
    : { to: LOGIN_ROUTE_PATH, label: 'Ir a iniciar sesión' }

  return (
    <main className="auth-page">
      <div className="auth-page__card">
        <AuthPageBrand />
        <h1>Acceso no autorizado</h1>
        <p className="auth-page__hint" role="alert">
          {hint}
        </p>
        {primaryAction ? (
          <Link className="auth-page__submit" to={primaryAction.to}>
            {primaryAction.label}
          </Link>
        ) : null}
        <Link className="auth-page__back" to={LANDING_ROUTE_PATH}>
          Volver a la página principal
        </Link>
      </div>
    </main>
  )
}

export default UnauthorizedPage
