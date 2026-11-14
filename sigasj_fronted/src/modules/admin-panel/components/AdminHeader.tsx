import { Link } from 'react-router-dom'
import { IconWorld } from '@tabler/icons-react'
import type { AdminHeaderProps } from '../props'
import { useAuthUser } from '../../auth/hooks/useAuthUser'
import { useAdminHeaderScrollVisibility } from '../hooks/useAdminHeaderScrollVisibility'
import AdminAccountMenu from './AdminAccountMenu'
import AdminHeaderMenuToggle from './AdminHeaderMenuToggle'
import NotificacionesCampana from '../../notificaciones/NotificacionesCampana'
import {
  getAuthUserHeaderAvatarUrl,
  getAuthUserHeaderRoleLabel,
  getAuthUserInitials,
  resolveAuthUserHeaderName,
} from '../../auth/utils/authUserDisplay'

export type { AdminHeaderProps }

const AdminHeaderUser = () => {
  const user = useAuthUser()
  const displayName = resolveAuthUserHeaderName(user)
  const roleLabel = getAuthUserHeaderRoleLabel(user, displayName)
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
  const hidden = useAdminHeaderScrollVisibility(menuOpen)

  return (
    <header
      className={`admin-header min-w-0${hidden ? ' admin-header--collapsed' : ''}`}
      data-scroll-hidden={hidden ? 'true' : 'false'}
      aria-label="Encabezado del panel administrativo"
    >
      <div className="admin-header__start min-w-0">
        <AdminHeaderMenuToggle
          menuOpen={menuOpen}
          onToggleMenu={onToggleMenu}
          menuToggleRef={menuToggleRef}
        />

        <div className="admin-header__brand-block">
          <p className="admin-header__brand-title">SIGASJ</p>
          <p className="admin-header__brand-subtitle">
            ASADA San Juan
          </p>
        </div>
      </div>

      <div className="admin-header__account min-w-0">
        <div className="admin-header__actions">
          <NotificacionesCampana />
          <Link
            className="admin-header__action admin-header__action--public admin-header__action--circle"
            to="/"
            aria-label="Ver sitio público"
            title="Sitio público"
          >
            <IconWorld size={20} stroke={1.9} aria-hidden="true" />
            <span className="visually-hidden">Sitio público</span>
          </Link>
          <AdminAccountMenu triggerContent={<AdminHeaderUser />} />
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
