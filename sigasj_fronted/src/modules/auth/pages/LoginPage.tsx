import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { resolvePostLoginAdminPath } from '../utils/adminNavigation'
import {
  INTERNAL_ADMIN_ROLES,
  InternalAdminRoleName,
  type InternalAdminRole,
} from '../utils/internalRoles'

type DevTokenResponse = {
  accessToken: string
  tokenType: string
  rol: string
  idUsuario: number
}

const getApiBaseUrl = (): string => import.meta.env?.VITE_API_URL ?? '/api'

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

  const completeLogin = (accessToken: string, role: string, id: string) => {
    const user = {
      id,
      role,
      name: 'Usuario',
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
      const url = `${getApiBaseUrl().replace(/\/$/, '')}/api/auth/dev-token`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rol: selectedRole }),
      })

      if (response.ok) {
        const payload = (await response.json()) as DevTokenResponse
        completeLogin(
          payload.accessToken,
          payload.rol,
          String(payload.idUsuario),
        )
        return
      }

      completeLogin(
        `local-${selectedRole.toLowerCase()}-session`,
        selectedRole,
        'demo-user-id',
      )
    } catch {
      completeLogin(
        `local-${selectedRole.toLowerCase()}-session`,
        selectedRole,
        'demo-user-id',
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
          Acceso administrativo de SIGASJ. Selecciona un rol interno; en
          desarrollo se intenta un token de prueba del backend y, si no está
          disponible, se usa una sesión local de demostración.
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
