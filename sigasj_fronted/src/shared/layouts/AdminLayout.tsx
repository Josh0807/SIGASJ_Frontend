import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Outlet } from 'react-router-dom'
import AdminMain from '../../modules/admin-panel/components/AdminMain'
import AdminSidebar from '../../modules/admin-panel/components/AdminSidebar'

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
