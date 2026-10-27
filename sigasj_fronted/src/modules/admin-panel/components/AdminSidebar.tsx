import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  IconBeach,
  IconCalendarEvent,
  IconChevronDown,
  IconClipboardList,
  IconCoin,
  IconFiles,
} from '@tabler/icons-react'
import asadaLogo from '../../../assets/ASADA LOGO.jpeg'
import AdminNavIcon from './AdminNavIcon'
import type { AdminSidebarItem, AdminSidebarProps } from '../props'
import {
  FORMULARIOS_DESCARGABLES_ADMIN_PATH,
  FORMULARIOS_OFICIALES_ADMIN_PATH,
  SOLICITUDES_ADMIN_PATH,
} from '../../solicitudes-publicas/admin/solicitudesAdminPaths'
import {
  FONTANERO_MIS_SOLICITUDES_PATH,
  FONTANERO_MIS_SOLICITUDES_TITLE,
  FONTANERO_SOLICITAR_PERMISO_PATH,
  FONTANERO_SOLICITAR_PERMISO_TITLE,
  FONTANERO_SOLICITAR_VACACIONES_PATH,
  FONTANERO_SOLICITAR_VACACIONES_TITLE,
  isFontaneroMisSolicitudesPath,
  isFontaneroSolicitarAusenciaPath,
} from '../../solicitudes-ausencia/solicitudesAusenciaPaths'
import {
  FONTANERO_MI_SALDO_PATH,
  FONTANERO_MI_SALDO_TITLE,
  isFontaneroMiSaldoPath,
} from '../../recursos-humanos/recursosHumanosPaths'

export type { AdminSidebarItem, AdminSidebarProps }

const FONTANERO_AUSENCIA_NAV_PATHS = new Set([
  FONTANERO_SOLICITAR_PERMISO_PATH,
  FONTANERO_SOLICITAR_VACACIONES_PATH,
  FONTANERO_MIS_SOLICITUDES_PATH,
  FONTANERO_MI_SALDO_PATH,
])

const FONTANERO_AUSENCIA_SUBLINKS = [
  {
    path: FONTANERO_SOLICITAR_PERMISO_PATH,
    title: FONTANERO_SOLICITAR_PERMISO_TITLE,
    Icon: IconCalendarEvent,
  },
  {
    path: FONTANERO_SOLICITAR_VACACIONES_PATH,
    title: FONTANERO_SOLICITAR_VACACIONES_TITLE,
    Icon: IconBeach,
  },
  {
    path: FONTANERO_MIS_SOLICITUDES_PATH,
    title: FONTANERO_MIS_SOLICITUDES_TITLE,
    Icon: IconClipboardList,
  },
  {
    path: FONTANERO_MI_SALDO_PATH,
    title: FONTANERO_MI_SALDO_TITLE,
    Icon: IconCoin,
  },
] as const

const sublinkClass = (isActive: boolean) =>
  `group flex min-h-9 items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs font-bold no-underline transition ${
    isActive
      ? 'bg-gradient-to-r from-[#3e8fd6] to-[#1e5a9c] text-white shadow-[0_7px_18px_rgba(62,143,214,0.32)]'
      : 'text-sky-100/80 hover:bg-white/10 hover:text-white'
  }`

const isFontaneroAusenciaNavActive = (pathname: string) =>
  isFontaneroSolicitarAusenciaPath(pathname) ||
  isFontaneroMisSolicitudesPath(pathname) ||
  isFontaneroMiSaldoPath(pathname)

const AdminSidebar = ({
  items = [],
  isDrawer = false,
  isOpen = false,
  onNavigate,
  onClose,
  closeButtonRef,
}: AdminSidebarProps) => {
  const sidebarRef = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const requestsActive = pathname.startsWith('/admin/solicitudes')
  const ausenciasActive = isFontaneroAusenciaNavActive(pathname)
  const [requestsOpen, setRequestsOpen] = useState(requestsActive)
  const [ausenciasOpen, setAusenciasOpen] = useState(ausenciasActive)
  if (requestsActive && !requestsOpen) {
    setRequestsOpen(true)
  }
  if (ausenciasActive && !ausenciasOpen) {
    setAusenciasOpen(true)
  }

  useEffect(() => {
    if (isDrawer && isOpen) {
      const sidebar = sidebarRef.current
      if (sidebar) {
        sidebar.scrollTop = 0
      }
    }
  }, [isDrawer, isOpen])

  let ausenciaGroupRendered = false

  return (
  <aside
    ref={sidebarRef}
    id="admin-navigation"
    className="admin-sidebar min-h-0 flex flex-col"
    aria-label="Menú administrativo"
    role={isDrawer && isOpen ? 'dialog' : undefined}
    aria-modal={isDrawer && isOpen ? true : undefined}
    inert={isDrawer && !isOpen ? true : undefined}
  >
    <div className="admin-sidebar__brand min-w-0">
      <span className="admin-sidebar__logo">
        <img src={asadaLogo} alt="" />
      </span>
      <span className="admin-sidebar__brand-text">
        <strong>SIGASJ</strong>
        <span>ASADA San Juan</span>
      </span>
      <button
        ref={closeButtonRef}
        className="admin-sidebar__close"
        type="button"
        aria-label="Cerrar menú administrativo"
        onClick={onClose}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
    </div>
    <nav className="admin-sidebar__nav min-h-0" aria-label="Navegación administrativa">
      {items.map(({ path, title, icon }) => {
        if (FONTANERO_AUSENCIA_NAV_PATHS.has(path)) {
          if (ausenciaGroupRendered) {
            return null
          }
          ausenciaGroupRendered = true
          return (
            <div className="grid gap-1" key="fontanero-ausencias">
              <div className="relative grid">
                <button
                  type="button"
                  className={`admin-sidebar__link w-full text-left${
                    ausenciasActive ? ' admin-sidebar__link--active' : ''
                  }`}
                  aria-expanded={ausenciasOpen}
                  aria-controls="fontanero-ausencias-submenu"
                  aria-label={
                    ausenciasOpen
                      ? 'Cerrar subsecciones de permisos y vacaciones'
                      : 'Abrir subsecciones de permisos y vacaciones'
                  }
                  onClick={() => setAusenciasOpen((open) => !open)}
                >
                  <span className="admin-sidebar__icon" aria-hidden="true" data-icon="rrhh">
                    <AdminNavIcon name="rrhh" />
                  </span>
                  <span className="admin-sidebar__label min-w-0 flex-1">
                    Permisos y vacaciones
                  </span>
                  <IconChevronDown
                    className={`ml-auto shrink-0 transition-transform duration-200 ${ausenciasOpen ? 'rotate-180' : ''}`}
                    size={17}
                    aria-hidden="true"
                  />
                </button>
              </div>
              {ausenciasOpen ? (
                <div
                  className="ml-5 grid gap-0.5 border-l border-white/20 pl-3"
                  id="fontanero-ausencias-submenu"
                >
                  {FONTANERO_AUSENCIA_SUBLINKS.map(({ path: subPath, title: subTitle, Icon }) => (
                    <NavLink
                      key={subPath}
                      to={subPath}
                      end
                      className={({ isActive }) => sublinkClass(isActive)}
                      onClick={onNavigate}
                    >
                      <Icon className="shrink-0" size={16} aria-hidden="true" />
                      <span>{subTitle}</span>
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          )
        }

        if (path === SOLICITUDES_ADMIN_PATH) {
          return (
        <div className="grid gap-1" key={path}>
          <div className="relative grid">
          <NavLink to={path} className={({ isActive }) => `admin-sidebar__link w-full pr-11 text-left${isActive ? ' admin-sidebar__link--active' : ''}`} aria-expanded={requestsOpen} aria-controls="admin-solicitudes-submenu" onClick={onNavigate}>
            <span className="admin-sidebar__icon" aria-hidden="true" data-icon={icon}><AdminNavIcon name={icon} /></span>
            <span className="admin-sidebar__label min-w-0 flex-1">{title}</span>
          </NavLink>
          <button className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white" type="button" aria-label={requestsOpen ? 'Cerrar subsecciones de solicitudes' : 'Abrir subsecciones de solicitudes'} aria-expanded={requestsOpen} aria-controls="admin-solicitudes-submenu" onClick={() => setRequestsOpen((open) => !open)}><IconChevronDown className={`transition-transform duration-200 ${requestsOpen ? 'rotate-180' : ''}`} size={17} aria-hidden="true" /></button>
          </div>
          {requestsOpen ? <div className="ml-5 grid gap-0.5 border-l border-white/20 pl-3" id="admin-solicitudes-submenu">
              <NavLink
                to={FORMULARIOS_OFICIALES_ADMIN_PATH}
                className={({ isActive }) => sublinkClass(isActive)}
                onClick={onNavigate}
              >
                <IconFiles className="shrink-0" size={17} aria-hidden="true" />
                <span>Formularios oficiales</span>
              </NavLink>
              <NavLink
                to={FORMULARIOS_DESCARGABLES_ADMIN_PATH}
                className={({ isActive }) => sublinkClass(isActive)}
                onClick={onNavigate}
              >
                <IconFiles className="shrink-0" size={17} aria-hidden="true" />
                <span>Formularios descargables</span>
              </NavLink>
          </div> : null}
        </div>
          )
        }

        return (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            isActive
              ? 'admin-sidebar__link admin-sidebar__link--active'
              : 'admin-sidebar__link'
          }
          onClick={onNavigate}
        >
          {({ isActive }) => (
            <>
              <span className="admin-sidebar__icon" aria-hidden="true" data-icon={icon}>
                <AdminNavIcon name={icon} />
              </span>
              <span className="admin-sidebar__label min-w-0">{title}</span>
              {isActive ? (
                <span className="admin-sidebar__active-mark" aria-hidden="true" />
              ) : null}
            </>
          )}
        </NavLink>
        )
      })}
    </nav>
    <div className="admin-sidebar__footer">
      <div className="admin-sidebar__system-status" role="status" aria-label="Estado del sistema: en línea">
        <span className="admin-sidebar__status-dot" aria-hidden="true" />
        <span className="admin-sidebar__status-copy">
          <strong>Sistema en línea</strong>
          <small>SIGASJ operativo</small>
        </span>
      </div>
    </div>
  </aside>
  )
}

export default AdminSidebar
