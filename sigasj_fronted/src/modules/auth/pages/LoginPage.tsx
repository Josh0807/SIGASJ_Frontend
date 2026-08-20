import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { requestDevToken } from '../services/authService'
import { resolvePostLoginAdminPath } from '../utils/adminNavigation'
import {
  INTERNAL_ADMIN_ROLES,
  InternalAdminRoleName,
  type InternalAdminRole,
} from '../utils/internalRoles'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? undefined

  const [selectedRole, setSelectedRole] = useState<InternalAdminRole>(
    InternalAdminRoleName.Administradora,
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const session = await requestDevToken(selectedRole)
      login(session)
      navigate(resolvePostLoginAdminPath(session.user, redirectTo), {
        replace: true,
      })
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo iniciar sesión con el backend.'

      setError(
        `${message} Verifica que el backend esté en ejecución y que el endpoint de desarrollo esté habilitado.`,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-page__card">
        <h1>Iniciar sesión</h1>
        <p className="auth-page__hint">
          Acceso administrativo de SIGASJ. Selecciona un rol interno para
          obtener un JWT de desarrollo desde el backend.
        </p>

        <form className="auth-page__form" onSubmit={onSubmit}>
          <label className="auth-page__field" htmlFor="login-role">
            Rol interno
          </label>
          <select
            id="login-role"
            className="auth-page__select"
            value={selectedRole}
            onChange={(event) =>
              setSelectedRole(event.target.value as InternalAdminRole)
            }
          >
            {INTERNAL_ADMIN_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="auth-page__submit"
            disabled={loading}
          >
            {loading ? 'Conectando…' : `Entrar como ${selectedRole.toLowerCase()}`}
          </button>
        </form>

        {error ? (
          <p className="auth-page__error" role="alert">
            {error}
          </p>
        ) : null}

        <Link className="auth-page__back" to="/">
          Volver a la página principal
        </Link>
      </div>
    </main>
  )
}

export default LoginPage
