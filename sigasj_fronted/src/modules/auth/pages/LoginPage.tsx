import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { fetchWithAuth } from '../../../services/http/httpClient'
import { resolvePostLoginAdminPath } from '../utils/adminNavigation'
import {
  INTERNAL_ADMIN_ROLES,
  InternalAdminRoleName,
  normalizeInternalRole,
  type InternalAdminRole,
} from '../utils/internalRoles'

type AuthLoginResponse = {
  accessToken: string
  user: { id: string | number; email: string; role: string; name?: string }
}

/** Correos alineados con las cuentas de desarrollo del backend (login por rol, sin contraseña en local). */
const DEV_LOGIN_EMAIL: Record<InternalAdminRole, string> = {
  Administradora: 'admin@asadasanjuan.cr',
  Secretaria: 'secretaria@asadasanjuan.cr',
  Fontanero: 'fontanero@asadasanjuan.cr',
}

/** El backend en desarrollo ignora la contraseña; el DTO aún exige un string mínimo. */
const DEV_LOGIN_PASSWORD_PLACEHOLDER = 'dev-login'

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

  const completeLogin = (
    accessToken: string,
    role: string,
    id: string,
    userEmail?: string,
    name?: string,
  ) => {
    const user = {
      id,
      role,
      email: userEmail,
      name: name?.trim() || 'Usuario',
      lastName: role,
    }
    login({ accessToken, user })
    navigate(resolvePostLoginAdminPath(user, redirectTo), { replace: true })
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const payload = await fetchWithAuth<AuthLoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: DEV_LOGIN_EMAIL[selectedRole],
          password: DEV_LOGIN_PASSWORD_PLACEHOLDER,
        }),
      })

      if (!payload.accessToken) {
        throw new Error('El servidor no devolvió un token de acceso.')
      }

      completeLogin(
        payload.accessToken,
        normalizeInternalRole(payload.user.role) ?? selectedRole,
        String(payload.user.id),
        payload.user.email,
        payload.user.name,
      )
    } catch (err) {
      const raw = err instanceof Error ? err.message : ''
      const isNetworkFailure =
        /failed to fetch|networkerror|load failed/i.test(raw)
      setError(
        isNetworkFailure
          ? 'No fue posible conectar con el servidor. Confirme que el backend esté en http://localhost:3000.'
          : raw
            ? `No fue posible iniciar sesión: ${raw.replace(/^HTTP \d+: /, '')}`
            : 'No fue posible iniciar sesión. Verifique que el backend esté en http://localhost:3000.',
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
          Acceso administrativo de SIGASJ. Selecciona un rol interno; el
          backend emite un token JWT de ese rol para consultar y guardar el
          contenido de la landing.
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
