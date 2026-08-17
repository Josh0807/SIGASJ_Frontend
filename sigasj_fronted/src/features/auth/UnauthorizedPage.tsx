import { Link } from 'react-router-dom'
import { getDefaultAdminHomePath } from './adminNavigation'
import { useAuth } from './AuthContext'
import { LOGIN_ROUTE_PATH } from '../../routes/routePaths'

const UnauthorizedPage = () => {
  const { isAuthenticated, user } = useAuth()
  const homePath = getDefaultAdminHomePath(user)

  if (!isAuthenticated) {
    return (
      <main className="auth-page">
        <div className="auth-page__card">
          <h1>Acceso no autorizado</h1>
          <p className="auth-page__hint">
            Debes iniciar sesión para acceder a esta sección.
          </p>
          <Link className="auth-page__submit" to={LOGIN_ROUTE_PATH}>
            Ir a iniciar sesión
          </Link>
          <Link className="auth-page__back" to="/">
            Volver a la página principal
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <div className="auth-page__card">
        <h1>Acceso no autorizado</h1>
        <p className="auth-page__hint">
          Tu cuenta no tiene permiso para acceder a esta función del panel
          administrativo. Si crees que se trata de un error, contacta a la
          administración de la ASADA.
        </p>
        {homePath ? (
          <Link className="auth-page__submit" to={homePath}>
            Volver al panel
          </Link>
        ) : null}
        <Link className="auth-page__back" to="/">
          Volver a la página principal
        </Link>
      </div>
    </main>
  )
}

export default UnauthorizedPage
