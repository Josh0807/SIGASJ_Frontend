import { Link, Navigate } from 'react-router-dom'
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

  if (!isAuthenticated) {
    return <Navigate to={LOGIN_ROUTE_PATH} replace />
  }

  return (
    <main className="auth-page" aria-labelledby="access-denied-title">
      <div className="auth-page__card">
        <AuthPageBrand />
        <h1 id="access-denied-title">Acceso denegado</h1>
        <p className="auth-page__hint" role="alert">
          No tiene permisos para acceder a esta sección.
        </p>
        {homePath ? (
          <Link className="auth-page__submit" to={homePath}>
            Volver al panel
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
