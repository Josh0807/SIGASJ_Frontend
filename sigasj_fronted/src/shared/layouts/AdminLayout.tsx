import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import AdminMain from '../../modules/admin-panel/components/AdminMain'
import AdminSidebar from '../../modules/admin-panel/components/AdminSidebar'
import { getAdminNavItemsForUser } from '../../modules/auth/utils/adminNavigation'
import { useAuthUser } from '../../modules/auth/hooks/useAuthUser'
import { UNAUTHORIZED_ROUTE_PATH } from '../../app/router/routePaths'

const MOBILE_NAV_QUERY = '(max-width: 760px)'

const subscribeToMobileNav = (onChange: () => void) => {
  if (typeof window.matchMedia !== 'function') {
    return () => {}
  }

  const media = window.matchMedia(MOBILE_NAV_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

const getMobileNavSnapshot = () =>
  typeof window.matchMedia === 'function' && window.matchMedia(MOBILE_NAV_QUERY).matches

const AdminLayout = () => {
  const user = useAuthUser()
  const navItems = getAdminNavItemsForUser(user)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const isMobileNav = useSyncExternalStore(
    subscribeToMobileNav,
    getMobileNavSnapshot,
    () => false,
  )
  const toggleRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const closeNav = () => setIsNavOpen(false)

  useEffect(() => {
    if (!isNavOpen) {
      return undefined
    }

    const toggleButton = toggleRef.current
    const closeButton = closeRef.current

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsNavOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    if (isMobileNav) {
      document.body.style.overflow = 'hidden'
      closeButton?.focus()
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      toggleButton?.focus()
    }
  }, [isNavOpen, isMobileNav])

  if (navItems.length === 0) {
    return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  }

  return (
    <div className={`admin-layout${isNavOpen ? ' admin-layout--nav-open' : ''}`}>
      {isNavOpen ? (
        <button
          type="button"
          className="admin-nav-backdrop"
          aria-label="Cerrar menú administrativo"
          tabIndex={-1}
          onClick={closeNav}
        />
      ) : null}
      <AdminSidebar
        items={navItems}
        isDrawer={isMobileNav}
        isOpen={isNavOpen}
        onNavigate={closeNav}
        onClose={closeNav}
        closeButtonRef={closeRef}
      />
      <AdminMain
        menuOpen={isNavOpen}
        onToggleMenu={() => setIsNavOpen((open) => !open)}
        menuToggleRef={toggleRef}
      >
        <Outlet />
      </AdminMain>
    </div>
  )
}

export default AdminLayout
