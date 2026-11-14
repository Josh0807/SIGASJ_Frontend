import { type FormEvent, useId, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import asadaLogo from '../../../assets/ASADA LOGO.jpeg'
import { LANDING_ROUTE_PATH } from '../../../app/router/routePaths'
import { useAuth } from '../components/AuthContext'
import { loginWithCredentials } from '../services/authApi'
import {
  GENERIC_LOGIN_ERROR_MESSAGE,
  mapLoginErrorMessage,
} from '../services/loginErrors'
import {
  buildAuthSessionFromLoginResponse,
  LoginResponseSecurityError,
} from '../services/loginSession'
import { consumeAuthSessionEndReason } from '../utils/authStorage'
import { resolvePostLoginAdminPath } from '../utils/adminNavigation'
import {
  validateLoginForm,
  type LoginFieldErrors,
} from './loginSchema'

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

export const SESSION_EXPIRED_MESSAGE =
  'Tu sesión expiró. Inicia sesión nuevamente para continuar.'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading: isAuthLoading, login, user } = useAuth()
  const loginState = location.state as { from?: string; message?: string } | null
  const redirectTo = loginState?.from ?? undefined
  const emailErrorId = useId()
  const passwordErrorId = useId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessionEndReason] = useState(consumeAuthSessionEndReason)
  const submittingRef = useRef(false)
  const statusMessage =
    loginState?.message ??
    (sessionEndReason === 'expired' ? SESSION_EXPIRED_MESSAGE : undefined)

  if (isAuthLoading) {
    return null
  }

  if (isAuthenticated && user) {
    return (
      <Navigate
        to={resolvePostLoginAdminPath(user, redirectTo)}
        replace
      />
    )
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingRef.current) {
      return
    }

    setError(null)

    const validation = validateLoginForm({ email, password })
    if (!validation.success) {
      setFieldErrors(validation.errors)
      return
    }

    setFieldErrors({})
    submittingRef.current = true
    setLoading(true)

    try {
      const payload = await loginWithCredentials(validation.data)
      const session = buildAuthSessionFromLoginResponse(payload)
      login(session)
      navigate(resolvePostLoginAdminPath(session.user, redirectTo), {
        replace: true,
      })
    } catch (err) {
      if (err instanceof LoginResponseSecurityError) {
        setError(GENERIC_LOGIN_ERROR_MESSAGE)
      } else {
        const raw = err instanceof Error ? err.message : ''
        setError(mapLoginErrorMessage(raw))
      }
    } finally {
      submittingRef.current = false
      setLoading(false)
    }
  }

  return (
    <main className="auth-page w-full min-w-0" aria-labelledby="login-title">
      <div className="auth-page__card w-full max-w-md">
        <AuthPageBrand />
        <h1 id="login-title">Iniciar sesión</h1>
        <p className="auth-page__hint">
          Ingresa tus credenciales para acceder al sistema.
        </p>
        {statusMessage ? (
          <p
            className="rounded-xl border border-amber-200 bg-amber-50 p-3 font-semibold text-amber-900"
            role="status"
          >
            {statusMessage}
          </p>
        ) : null}

        <form className="auth-page__form" onSubmit={onSubmit} noValidate>
          <label className="auth-page__field" htmlFor="login-email">
            Correo electrónico
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (fieldErrors.email) {
                  setFieldErrors((current) => ({ ...current, email: undefined }))
                }
              }}
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={fieldErrors.email ? emailErrorId : undefined}
              disabled={loading}
            />
            {fieldErrors.email ? (
              <span id={emailErrorId} className="auth-page__field-error" role="alert">
                {fieldErrors.email}
              </span>
            ) : null}
          </label>

          <label className="auth-page__field" htmlFor="login-password">
            Contraseña
            <span className="auth-page__password-wrap">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (fieldErrors.password) {
                    setFieldErrors((current) => ({
                      ...current,
                      password: undefined,
                    }))
                  }
                }}
                aria-invalid={fieldErrors.password ? true : undefined}
                aria-describedby={
                  fieldErrors.password ? passwordErrorId : undefined
                }
                disabled={loading}
              />
              <button
                type="button"
                className="auth-page__password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <IconEyeOff size={20} aria-hidden="true" />
                ) : (
                  <IconEye size={20} aria-hidden="true" />
                )}
              </button>
            </span>
            {fieldErrors.password ? (
              <span
                id={passwordErrorId}
                className="auth-page__field-error"
                role="alert"
              >
                {fieldErrors.password}
              </span>
            ) : null}
          </label>

          {/*
            BLOCKED — recuperación pendiente.
            No existe ruta pública de recuperación/reset en el router actual.
            No se deja enlace muerto (href="#").
          */}

          <button
            type="submit"
            className="auth-page__submit"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        {error ? (
          <p className="auth-page__error" role="alert">
            {error}
          </p>
        ) : null}

        <Link className="auth-page__back" to={LANDING_ROUTE_PATH}>
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}

export default LoginPage
