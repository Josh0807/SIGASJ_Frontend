import { IconId, IconMail, IconShield, IconUserCircle } from '@tabler/icons-react'
import { useAuth } from '../components/AuthContext'
import {
  getAuthUserDisplayName,
  resolveAuthUserDisplayName,
} from '../utils/authUserDisplay'

const ProfilePage = () => {
  const { user } = useAuth()
  const displayName = resolveAuthUserDisplayName(user)
  const hasNamedIdentity = Boolean(getAuthUserDisplayName(user))
  const email = user?.email?.trim() || 'No registrado'
  const role = user?.role?.trim() || 'Sin rol asignado'
  const userId = user?.id?.trim()

  return (
    <main className="admin-surface-page" aria-labelledby="profile-page-title">
      <header className="grid gap-2">
        <p className="m-0 text-xs font-extrabold uppercase tracking-[0.22em] text-blue-600">
          Cuenta administrativa
        </p>
        <h1 id="profile-page-title" className="m-0 text-3xl font-black tracking-tight text-[#062e63]">
          Mi perfil
        </h1>
        <p className="m-0 text-slate-500">
          Datos de la sesión actual. La edición de cuenta se gestiona con la Administradora.
        </p>
      </header>

      <section className="admin-surface-card" aria-label="Datos del perfil">
        <div className="flex items-start gap-4">
          <span
            className="grid size-14 place-items-center rounded-2xl border border-white/70 bg-linear-to-br from-blue-600 to-cyan-400 text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)]"
            aria-hidden="true"
          >
            <IconUserCircle size={30} />
          </span>
          <div className="min-w-0">
            <p className="mb-1 text-xs font-extrabold uppercase tracking-wider text-blue-600">
              Usuario en sesión
            </p>
            <h2 className="m-0 truncate text-2xl font-black text-[#062e63]">{displayName}</h2>
            {!hasNamedIdentity ? (
              <p className="mb-0 mt-1 text-sm text-slate-500">
                Nombre no disponible en el perfil; se muestra el correo o un valor por defecto.
              </p>
            ) : null}
          </div>
        </div>

        <dl className="m-0 grid gap-3 sm:grid-cols-2">
          <div className="admin-surface-stat">
            <dt className="flex items-center gap-2">
              <IconMail size={16} aria-hidden="true" />
              Correo
            </dt>
            <dd>{email}</dd>
          </div>
          <div className="admin-surface-stat">
            <dt className="flex items-center gap-2">
              <IconShield size={16} aria-hidden="true" />
              Rol
            </dt>
            <dd>{role}</dd>
          </div>
          {userId ? (
            <div className="admin-surface-stat sm:col-span-2">
              <dt className="flex items-center gap-2">
                <IconId size={16} aria-hidden="true" />
                Identificador
              </dt>
              <dd className="font-mono text-sm">{userId}</dd>
            </div>
          ) : null}
        </dl>
      </section>
    </main>
  )
}

export default ProfilePage
