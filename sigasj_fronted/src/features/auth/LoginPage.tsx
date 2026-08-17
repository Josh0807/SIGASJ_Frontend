import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../../shared/api/ApiError'
import { getApiBaseUrl } from '../../shared/api/config'
import { resolvePostLoginAdminPath } from './adminNavigation'
import type { InternalAdminRole } from './auth.types'
import { INTERNAL_ADMIN_ROLES } from './auth.types'
import { useAuth } from './AuthContext'

type DevTokenResponse = {
  accessToken: string
  tokenType: string
  rol: string
  idUsuario: number
}

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? undefined

  const [selectedRole, setSelectedRole] = useState<InternalAdminRole>('Administradora')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const url = `${getApiBaseUrl()}/api/auth/dev-token`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rol: selectedRole }),
      })

      if (!response.ok) {
        throw new ApiError(
          'No fue posible iniciar sesión. Verifica que el backend esté en ejecución.',
          'HTTP',
          response.status,
        )
      }

      const payload = (await response.json()) as DevTokenResponse
      const user = {
        rol: payload.rol,
        idUsuario: payload.idUsuario,
      }
      login({
        accessToken: payload.accessToken,
        user,
      })
      navigate(resolvePostLoginAdminPath(user, redirectTo), { replace: true })
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message)
      } else {
        setError('No fue posible iniciar sesión.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-page__card">
        <h1>Iniciar sesión</h1>
        <p className="auth-page__hint">
          Acceso administrativo de SIGASJ. En desarrollo se usa un token de
          prueba del backend.
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
