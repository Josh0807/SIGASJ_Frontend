import type { Ref } from 'react'
import { Link } from 'react-router-dom'
import { useAuthUser } from '../../auth/hooks/useAuthUser'
import AdminAccountMenu from './AdminAccountMenu'
import AdminHeaderMenuToggle from './AdminHeaderMenuToggle'
import {
  getAuthUserAvatarUrl,
  getAuthUserDisplayName,
  getAuthUserInitials,
  getAuthUserRoleLabel,
} from '../../auth/utils/authUserDisplay'

export type AdminHeaderProps = {
  menuOpen?: boolean
  onToggleMenu?: () => void
  menuToggleRef?: Ref<HTMLButtonElement>
}

const FALLBACK_USER_NAME = 'Sesión administrativa'
const FALLBACK_USER_DETAIL = 'SIGASJ'

const AdminHeaderUser = () => {
  const user = useAuthUser()
  const displayName = getAuthUserDisplayName(user) ?? FALLBACK_USER_NAME
  const roleLabel = getAuthUserRoleLabel(user)
  const avatarUrl = getAuthUserAvatarUrl(user)
  const initials = getAuthUserInitials(displayName)
  const showDetail = Boolean(roleLabel) || !user
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
        {showDetail ? (
          <span className="admin-header__user-detail">
            {roleLabel ?? FALLBACK_USER_DETAIL}
          </span>
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

        <div className="admin-header__actions">
          <Link
            className="admin-header__action admin-header__action--public"
            to="/"
            aria-label="Ver sitio público"
          >
            <span
              className="admin-header__action-label admin-header__action-label--full"
              aria-hidden="true"
            >
              Ver sitio público
            </span>
            <span
              className="admin-header__action-label admin-header__action-label--short"
              aria-hidden="true"
            >
              Público
            </span>
          </Link>
          <AdminAccountMenu />
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
