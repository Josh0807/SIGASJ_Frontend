import type { AdminHeaderProps } from '../props'
import { useAuthUser } from '../../auth/hooks/useAuthUser'
import AdminHeaderMenuToggle from './AdminHeaderMenuToggle'
import {
  getAuthUserHeaderAvatarUrl,
  getAuthUserInitials,
  getAuthUserRoleLabel,
  resolveAuthUserHeaderName,
} from '../../auth/utils/authUserDisplay'

export type { AdminHeaderProps }

const AdminHeaderUser = () => {
  const user = useAuthUser()
  const displayName = resolveAuthUserHeaderName(user)
  const roleLabel = getAuthUserRoleLabel(user)
  const avatarUrl = getAuthUserHeaderAvatarUrl(user)
  const initials = getAuthUserInitials(displayName)
  const accessibleSummary = roleLabel
    ? `${displayName}, ${roleLabel}`
    : displayName

  return (
    <div className="admin-header__user">
      <span className="visually-hidden">{accessibleSummary}</span>

      {avatarUrl ? (
        <img
          className="admin-header__avatar admin-header__avatar--image"
          src={avatarUrl}
          alt=""
        />
      ) : (
        <span className="admin-header__avatar" aria-hidden="true">
          {initials}
        </span>
      )}

      <span className="admin-header__user-copy" aria-hidden="true">
        <span className="admin-header__user-name">{displayName}</span>
        {roleLabel ? (
          <span className="admin-header__user-detail">{roleLabel}</span>
        ) : null}
      </span>
    </div>
  )
}

const AdminHeader = ({
  menuOpen = false,
  onToggleMenu,
  menuToggleRef,
}: AdminHeaderProps) => {
  return (
    <header className="admin-header" aria-label="Encabezado del panel administrativo">
      <div className="admin-header__start">
        <AdminHeaderMenuToggle
          menuOpen={menuOpen}
          onToggleMenu={onToggleMenu}
          menuToggleRef={menuToggleRef}
        />

        <p className="admin-header__title">Panel administrativo</p>
      </div>

      <div className="admin-header__account">
        <AdminHeaderUser />
      </div>
    </header>
  )
}

export default AdminHeader
