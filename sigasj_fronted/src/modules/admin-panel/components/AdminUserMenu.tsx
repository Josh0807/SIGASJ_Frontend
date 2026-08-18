import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAccessToken } from '../../auth/utils/authStorage'
import type { AdminUserMenuProps } from '../props'

export type { AdminUserMenuProps }

/**
 * Componente de menú/perfil de usuario para el panel administrativo.
 * Soporta variante en el pie del Sidebar (por defecto) o en el Header.
 * Muestra avatar, nombre de usuario, rol y opción de cierre de sesión.
 */
const AdminUserMenu = ({
  userName = 'Administrador',
  userRole = 'ASADA San Juan',
  userInitials = 'AD',
  variant = 'sidebar',
}: AdminUserMenuProps) => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    clearAccessToken()
    navigate('/login')
  }

  useEffect(() => {
    if (!isOpen) return undefined

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  const menuClass = `admin-user-menu admin-user-menu--${variant}`

  return (
    <div className={menuClass}>
      <button
        type="button"
        className={`admin-user-menu__trigger ${isOpen ? 'admin-user-menu__trigger--open' : ''}`}
        aria-label={`Menú de usuario para ${userName}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="admin-user-menu__avatar" aria-hidden="true">
          {userInitials}
        </span>
        <div className="admin-user-menu__info">
          <span className="admin-user-menu__name">{userName}</span>
          <span className="admin-user-menu__role">{userRole}</span>
        </div>
        <svg
          className="admin-user-menu__chevron"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen ? (
        <div className="admin-user-menu__dropdown" role="menu" aria-label="Opciones de cuenta">
          <div className="admin-user-menu__dropdown-header">
            <strong>{userName}</strong>
            <small>{userRole}</small>
          </div>
          <hr className="admin-user-menu__divider" />
          <button
            type="button"
            className="admin-user-menu__logout-btn"
            role="menuitem"
            onClick={handleLogout}
          >
            <span className="admin-user-menu__logout-icon" aria-hidden="true">&#x21aa;</span>
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default AdminUserMenu
