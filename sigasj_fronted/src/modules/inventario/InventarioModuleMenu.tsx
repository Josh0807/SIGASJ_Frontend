import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  IconAdjustments,
  IconAlertTriangle,
  IconArrowsExchange,
  IconBox,
  IconCategory,
  IconClipboardCheck,
  IconDots,
  IconFileAnalytics,
  IconPackage,
  IconPackageExport,
  IconPackageImport,
  IconPackageOff,
  IconPrinter,
  IconTransfer,
  IconTruck,
} from '@tabler/icons-react'
import { useAuth } from '../auth/components/AuthContext'
import {
  InternalAdminRoleName,
  normalizeInternalRole,
} from '../auth/utils/internalRoles'
import {
  ALERTAS_REPOSICION_PATH,
  CATEGORIAS_PATH,
  ENTRADAS_PATH,
  IMPRIMIR_INVENTARIO_PATH,
  MATERIALES_PATH,
  MOVIMIENTOS_PATH,
  PROVEEDORES_PATH,
  RECEPCIONES_PATH,
  REPORTES_INVENTARIO_PATH,
  REPOSICIONES_PATH,
  SALIDAS_PATH,
  SOLICITUDES_MATERIALES_PATH,
  SOLICITUDES_REVISION_PATH,
} from './inventarioPaths'

type NavItem = {
  label: string
  to: string
  icon: typeof IconPackage
  match?: (pathname: string) => boolean
}

type InventarioModuleMenuProps = {
  /** Cuando true, se renderiza dentro de una página (p. ej. nueva solicitud). */
  inline?: boolean
}

function pathStarts(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`)
}

function isActiveItem(pathname: string, item: NavItem) {
  if (item.match) return item.match(pathname)
  return pathStarts(pathname, item.to)
}

export default function InventarioModuleMenu({
  inline = false,
}: InventarioModuleMenuProps) {
  const { user } = useAuth()
  const location = useLocation()
  const role = normalizeInternalRole(user?.role)
  const isAdmin = role === InternalAdminRoleName.Administradora
  const isSecretaria = role === InternalAdminRoleName.Secretaria
  const isFontanero = role === InternalAdminRoleName.Fontanero
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const moreId = useId()

  useEffect(() => {
    setMoreOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!moreOpen) return
    const onPointer = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [moreOpen])

  const tabs: NavItem[] = []

  if (isAdmin || isSecretaria || isFontanero) {
    tabs.push({
      label: 'Materiales',
      to: MATERIALES_PATH,
      icon: IconPackage,
      match: (pathname) =>
        pathStarts(pathname, MATERIALES_PATH) ||
        pathname === '/admin/inventario' ||
        pathname === '/admin/inventario/',
    })
  }

  if (isAdmin || isSecretaria) {
    tabs.push({
      label: 'Movimientos',
      to: MOVIMIENTOS_PATH,
      icon: IconTransfer,
      match: (pathname) =>
        pathStarts(pathname, MOVIMIENTOS_PATH) ||
        pathStarts(pathname, ENTRADAS_PATH) ||
        pathStarts(pathname, SALIDAS_PATH),
    })
  } else if (isFontanero) {
    tabs.push({
      label: 'Movimientos',
      to: SALIDAS_PATH,
      icon: IconTransfer,
      match: (pathname) => pathStarts(pathname, SALIDAS_PATH),
    })
  }

  if (isAdmin) {
    tabs.push({
      label: 'Abastecimiento',
      to: SOLICITUDES_REVISION_PATH,
      icon: IconClipboardCheck,
      match: (pathname) =>
        pathStarts(pathname, SOLICITUDES_REVISION_PATH) ||
        pathStarts(pathname, ALERTAS_REPOSICION_PATH) ||
        pathStarts(pathname, REPOSICIONES_PATH) ||
        pathStarts(pathname, RECEPCIONES_PATH),
    })
  } else if (isFontanero) {
    tabs.push({
      label: 'Abastecimiento',
      to: SOLICITUDES_MATERIALES_PATH,
      icon: IconClipboardCheck,
      match: (pathname) => pathStarts(pathname, SOLICITUDES_MATERIALES_PATH),
    })
  }

  if (isAdmin || isSecretaria || isFontanero) {
    tabs.push({
      label: 'Configuración',
      to: CATEGORIAS_PATH,
      icon: IconAdjustments,
      match: (pathname) =>
        pathStarts(pathname, CATEGORIAS_PATH) ||
        pathStarts(pathname, PROVEEDORES_PATH),
    })
  }

  const movimientosSub: NavItem[] = []
  if (isAdmin) {
    movimientosSub.push(
      { label: 'Registrar entrada', to: ENTRADAS_PATH, icon: IconPackageImport },
      { label: 'Registrar salida', to: SALIDAS_PATH, icon: IconPackageExport },
      { label: 'Historial', to: MOVIMIENTOS_PATH, icon: IconArrowsExchange },
    )
  } else if (isFontanero) {
    movimientosSub.push({
      label: 'Registrar salida',
      to: SALIDAS_PATH,
      icon: IconPackageExport,
    })
  } else if (isSecretaria) {
    movimientosSub.push({
      label: 'Historial',
      to: MOVIMIENTOS_PATH,
      icon: IconArrowsExchange,
    })
  }

  const abastecimientoSub: NavItem[] = []
  if (isAdmin) {
    abastecimientoSub.push(
      {
        label: 'Revisar solicitudes',
        to: SOLICITUDES_REVISION_PATH,
        icon: IconClipboardCheck,
      },
      {
        label: 'Alertas de reposición',
        to: ALERTAS_REPOSICION_PATH,
        icon: IconAlertTriangle,
      },
      { label: 'Reposiciones', to: REPOSICIONES_PATH, icon: IconBox },
      { label: 'Recepciones', to: RECEPCIONES_PATH, icon: IconPackageOff },
    )
  } else if (isFontanero) {
    abastecimientoSub.push({
      label: 'Mis solicitudes',
      to: SOLICITUDES_MATERIALES_PATH,
      icon: IconClipboardCheck,
    })
  }

  const configSub: NavItem[] = [
    { label: 'Categorías', to: CATEGORIAS_PATH, icon: IconCategory },
  ]
  if (isAdmin || isSecretaria) {
    configSub.push({
      label: 'Proveedores',
      to: PROVEEDORES_PATH,
      icon: IconTruck,
    })
  }

  const secondary: NavItem[] = []
  if (isAdmin || isSecretaria) {
    secondary.push(
      {
        label: 'Reportes',
        to: REPORTES_INVENTARIO_PATH,
        icon: IconFileAnalytics,
      },
      {
        label: 'Imprimir inventario',
        to: IMPRIMIR_INVENTARIO_PATH,
        icon: IconPrinter,
      },
    )
  }

  const onMovimientos = movimientosSub.some((item) =>
    isActiveItem(location.pathname, item),
  )
  const onAbastecimiento = abastecimientoSub.some((item) =>
    isActiveItem(location.pathname, item),
  )
  const onConfig = configSub.some((item) =>
    isActiveItem(location.pathname, item),
  )

  let sectionSub: NavItem[] = []
  if (onMovimientos) sectionSub = movimientosSub
  else if (onAbastecimiento) sectionSub = abastecimientoSub
  else if (onConfig) sectionSub = configSub

  if (tabs.length === 0) return null

  return (
    <div
      className={`inv-nav-stack${inline ? ' inv-nav-stack--inline' : ''}`}
      style={{ display: 'grid', gap: 10 }}
    >
      <nav className="inv-tabs" aria-label="Secciones de inventario">
        {tabs.map((tab) => {
          const active = isActiveItem(location.pathname, tab)
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.label}
              to={tab.to}
              className={`inv-tabs__link${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={18} stroke={1.8} aria-hidden="true" />
              {tab.label}
            </NavLink>
          )
        })}

        {secondary.length > 0 ? (
          <div className="inv-tabs__more" ref={moreRef}>
            <button
              type="button"
              className="inv-tabs__link"
              aria-expanded={moreOpen}
              aria-controls={moreId}
              aria-haspopup="menu"
              onClick={() => setMoreOpen((value) => !value)}
            >
              <IconDots size={18} stroke={1.8} aria-hidden="true" />
              Más
            </button>
            {moreOpen ? (
              <div id={moreId} className="inv-tabs__dropdown" role="menu">
                {secondary.map((item) => {
                  const active = isActiveItem(location.pathname, item)
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      role="menuitem"
                      className={active ? 'is-active' : undefined}
                      onClick={() => setMoreOpen(false)}
                    >
                      <Icon size={18} stroke={1.8} aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  )
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </nav>

      {sectionSub.length > 1 ? (
        <nav
          className="inv-tabs inv-tabs--sub"
          aria-label="Operaciones de la sección"
        >
          {sectionSub.map((item) => {
            const active = isActiveItem(location.pathname, item)
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`inv-tabs__link${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={16} stroke={1.8} aria-hidden="true" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      ) : null}
    </div>
  )
}
