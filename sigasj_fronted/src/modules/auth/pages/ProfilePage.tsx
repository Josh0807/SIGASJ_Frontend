import { IconId, IconMail, IconShield, IconUserCircle } from '@tabler/icons-react'
import { AdminShell, PageHeader } from '../../../shared/ui'
import { useAuth } from '../components/AuthContext'
import {
  getAuthUserDisplayName,
  resolveAuthUserDisplayName,
} from '../utils/authUserDisplay'

const initialsFromName = (name: string) => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

const ProfilePage = () => {
  const { user } = useAuth()
  const displayName = resolveAuthUserDisplayName(user)
  const hasNamedIdentity = Boolean(getAuthUserDisplayName(user))
  const email = user?.email?.trim() || 'No registrado'
  const role = user?.role?.trim() || 'Sin rol asignado'
  const userId = user?.id?.trim()
  const initials = initialsFromName(displayName)

  return (
    <AdminShell className="admin-profile gap-4" aria-labelledby="profile-page-title">
      <PageHeader
        id="profile-page-title"
        title="Mi perfil"
        description="Su sesión en SIGASJ. Los cambios de cuenta los gestiona la Administradora."
      />

      <section className="admin-surface-card admin-profile__card" aria-label="Datos del perfil">
        <div className="admin-profile__identity">
          <span className="admin-profile__avatar" aria-hidden="true">
            {hasNamedIdentity ? initials : <IconUserCircle size={28} stroke={1.8} />}
          </span>
          <div className="admin-profile__identity-copy">
            <p className="admin-profile__kicker">Usuario en sesión</p>
            <h2>{displayName}</h2>
            {!hasNamedIdentity ? (
              <p className="admin-profile__hint">
                Nombre no disponible en el perfil; se muestra el correo o un valor por defecto.
              </p>
            ) : null}
            <span className="admin-profile__role-badge">
              <IconShield size={14} aria-hidden="true" />
              {role}
            </span>
          </div>
        </div>

        <dl className="admin-profile__facts">
          <div className="admin-profile__fact">
            <dt>
              <IconMail size={16} aria-hidden="true" />
              Correo
            </dt>
            <dd>{email}</dd>
          </div>
          {userId ? (
            <div className="admin-profile__fact">
              <dt>
                <IconId size={16} aria-hidden="true" />
                Identificador
              </dt>
              <dd className="admin-profile__id">{userId}</dd>
            </div>
          ) : null}
        </dl>

        <p className="admin-profile__note" role="note">
          Solo lectura. Para cambios de correo, rol o acceso, solicítelo a la Administradora.
        </p>
      </section>
    </AdminShell>
  )
}

export default ProfilePage