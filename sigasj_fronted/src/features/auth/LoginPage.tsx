import { type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { setAccessToken } from './authStorage'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? '/admin/galeria'

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAccessToken('local-admin-session')
    navigate(redirectTo, { replace: true })
  }

  return (
    <main className="auth-page">
      <div className="auth-page__card">
        <h1>Iniciar sesión</h1>
        <p className="auth-page__hint">
          Acceso administrativo de SIGASJ. El ingreso es local y no requiere un
          servidor.
        </p>

        <form className="auth-page__form" onSubmit={onSubmit}>
          <button type="submit" className="auth-page__submit">
            Entrar como administradora
          </button>
        </form>

        <Link className="auth-page__back" to="/">
          Volver a la página principal
        </Link>
      </div>
    </main>
  )
}

export default LoginPage
