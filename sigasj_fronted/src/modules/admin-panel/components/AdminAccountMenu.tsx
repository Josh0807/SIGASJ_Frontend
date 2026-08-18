import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { Link } from 'react-router-dom'
import {
  ADMIN_PROFILE_PATH,
  ADMIN_PROFILE_TITLE,
} from '../../../app/router/privateRoutes'
import { useAdminLogout } from '../../auth/hooks/useAdminLogout'
import { ADMIN_ACCOUNT_MENU_PLACEHOLDER_ITEMS } from '../config/adminAccountMenuConfig'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'

const LOGOUT_DIALOG_TITLE = 'Cerrar sesión'
const LOGOUT_DIALOG_MESSAGE =
  'Confirme si desea cerrar sesión. Deberá iniciar sesión nuevamente para acceder al panel administrativo.'

const AdminAccountMenu = () => {
  const menuId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const profileLinkRef = useRef<HTMLAnchorElement>(null)
  const logoutButtonRef = useRef<HTMLButtonElement>(null)
  const openedViaKeyboardRef = useRef(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const isLogoutConfirmingRef = useRef(false)
  const logout = useAdminLogout()

  const closeMenu = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggleMenu = useCallback(() => {
    setIsOpen((open) => !open)
  }, [])

  const getFocusableMenuItems = useCallback((): Array<
    HTMLAnchorElement | HTMLButtonElement
  > => {
    return [profileLinkRef.current, logoutButtonRef.current].filter(
      (item): item is HTMLAnchorElement | HTMLButtonElement => item instanceof HTMLElement,
    )
  }, [])

  const focusFirstMenuItem = useCallback(() => {
    getFocusableMenuItems()[0]?.focus()
  }, [getFocusableMenuItems])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    if (openedViaKeyboardRef.current) {
      openedViaKeyboardRef.current = false
      focusFirstMenuItem()
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target

      if (!(target instanceof Node) || !containerRef.current?.contains(target)) {
        closeMenu()
      }
    }

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
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
  }, [closeMenu, focusFirstMenuItem, isOpen])

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      openedViaKeyboardRef.current = true
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()

      if (!isOpen) {
        setIsOpen(true)
        return
      }

      focusFirstMenuItem()
    }
  }

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = getFocusableMenuItems()
    const currentIndex = items.findIndex((item) => item === document.activeElement)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length
      items[nextIndex]?.focus()
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const nextIndex =
        currentIndex <= 0 ? items.length - 1 : currentIndex - 1
      items[nextIndex]?.focus()
    }

    if (event.key === 'Home') {
      event.preventDefault()
      items[0]?.focus()
    }

    if (event.key === 'End') {
      event.preventDefault()
      items[items.length - 1]?.focus()
    }
  }

  const handleProfileKeyDown = (event: ReactKeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === ' ') {
      event.preventDefault()
      event.currentTarget.click()
    }
  }

  const handleLogoutRequest = () => {
    closeMenu()
    setIsLogoutDialogOpen(true)
  }

  const handleLogoutCancel = useCallback(() => {
    setIsLogoutDialogOpen(false)
  }, [])

  const handleLogoutConfirm = useCallback(() => {
    if (isLogoutConfirmingRef.current) {
      return
    }

    isLogoutConfirmingRef.current = true
    setIsLogoutDialogOpen(false)
    logout()
  }, [logout])

  return (
    <>
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
        onKeyDown={handleTriggerKeyDown}
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
        onKeyDown={handleMenuKeyDown}
      >
        <Link
          ref={profileLinkRef}
          to={ADMIN_PROFILE_PATH}
          className="admin-account-menu__item admin-account-menu__item--link"
          role="menuitem"
          onClick={closeMenu}
          onKeyDown={handleProfileKeyDown}
        >
          <span className="admin-account-menu__item-label">{ADMIN_PROFILE_TITLE}</span>
        </Link>

        {ADMIN_ACCOUNT_MENU_PLACEHOLDER_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="admin-account-menu__item admin-account-menu__item--disabled"
            role="menuitem"
            disabled
            aria-disabled="true"
            title={item.hint}
            tabIndex={-1}
          >
            <span className="admin-account-menu__item-label">{item.label}</span>
            {item.hint ? (
              <span className="admin-account-menu__item-hint">{item.hint}</span>
            ) : null}
          </button>
        ))}

        <button
          ref={logoutButtonRef}
          type="button"
          className="admin-account-menu__item admin-account-menu__item--danger"
          role="menuitem"
          onClick={handleLogoutRequest}
        >
          Cerrar sesión
        </button>
      </div>
    </div>

    <ConfirmDialog
      isOpen={isLogoutDialogOpen}
      title={LOGOUT_DIALOG_TITLE}
      message={LOGOUT_DIALOG_MESSAGE}
      cancelLabel="Cancelar"
      confirmLabel={LOGOUT_DIALOG_TITLE}
      confirmDanger
      returnFocusRef={triggerRef}
      onCancel={handleLogoutCancel}
      onConfirm={handleLogoutConfirm}
    />
    </>
  )
}

export default AdminAccountMenu
