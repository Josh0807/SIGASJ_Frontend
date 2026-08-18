import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useAdminLogout } from '../../auth/hooks/useAdminLogout'
import { ADMIN_ACCOUNT_MENU_PLACEHOLDER_ITEMS } from '../config/adminAccountMenuConfig'

const AdminAccountMenu = () => {
  const menuId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const logout = useAdminLogout()

  const closeMenu = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggleMenu = useCallback(() => {
    setIsOpen((open) => !open)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target

      if (!(target instanceof Node) || !containerRef.current?.contains(target)) {
        closeMenu()
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu()
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [closeMenu, isOpen])

  const handleLogout = () => {
    closeMenu()
    logout()
  }

  return (
    <div
      ref={containerRef}
      className={`admin-account-menu${isOpen ? ' admin-account-menu--open' : ''}`}
    >
      <button
        ref={triggerRef}
        type="button"
        className="admin-account-menu__trigger"
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-label="Opciones de cuenta"
        onClick={toggleMenu}
      >
        <span
          className="admin-account-menu__trigger-label admin-account-menu__trigger-label--full"
          aria-hidden="true"
        >
          Opciones de cuenta
        </span>
        <span
          className="admin-account-menu__trigger-label admin-account-menu__trigger-label--short"
          aria-hidden="true"
        >
          Cuenta
        </span>
      </button>

      <div
        id={menuId}
        className="admin-account-menu__panel"
        role="menu"
        aria-label="Opciones generales de cuenta"
        hidden={!isOpen}
      >
        {ADMIN_ACCOUNT_MENU_PLACEHOLDER_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="admin-account-menu__item admin-account-menu__item--disabled"
            role="menuitem"
            disabled
            aria-disabled="true"
            title={item.hint}
          >
            <span className="admin-account-menu__item-label">{item.label}</span>
            {item.hint ? (
              <span className="admin-account-menu__item-hint">{item.hint}</span>
            ) : null}
          </button>
        ))}

        <button
          type="button"
          className="admin-account-menu__item admin-account-menu__item--danger"
          role="menuitem"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default AdminAccountMenu
