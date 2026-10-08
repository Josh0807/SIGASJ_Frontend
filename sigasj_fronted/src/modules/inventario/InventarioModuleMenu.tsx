import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import {
  IconAlertTriangle,
  IconArrowsExchange,
  IconBox,
  IconCategory,
  IconChevronDown,
  IconClipboardCheck,
  IconFileAnalytics,
  IconLayoutGrid,
  IconPrinter,
  IconPackageExport,
  IconPackageImport,
  IconPackageOff,
  IconPackages,
  IconPlus,
  IconTruck,
} from '@tabler/icons-react'
import { useAuth } from '../auth/components/AuthContext'
import { InternalAdminRoleName, normalizeInternalRole } from '../auth/utils/internalRoles'
import {
  ALERTAS_REPOSICION_PATH,
  CATEGORIAS_PATH,
  ENTRADAS_PATH,
  MATERIAL_NEW_PATH,
  MATERIALES_PATH,
  MOVIMIENTOS_PATH,
  PROVEEDORES_PATH,
  RECEPCIONES_PATH,
  IMPRIMIR_INVENTARIO_PATH,
  REPORTES_INVENTARIO_PATH,
  REPOSICIONES_PATH,
  SALIDAS_PATH,
  SOLICITUDES_MATERIALES_PATH,
  SOLICITUDES_REVISION_PATH,
} from './inventarioPaths'

const adminItems = [
  { label: 'Materiales', description: 'Catálogo y existencias', to: MATERIALES_PATH, icon: IconPackages },
  { label: 'Nuevo material', description: 'Agregar al catálogo', to: MATERIAL_NEW_PATH, icon: IconPlus },
  { label: 'Categorías', description: 'Clasificaciones', to: CATEGORIAS_PATH, icon: IconCategory },
  { label: 'Proveedores', description: 'Contactos comerciales', to: PROVEEDORES_PATH, icon: IconTruck },
  { label: 'Registrar entrada', description: 'Ingreso a bodega', to: ENTRADAS_PATH, icon: IconPackageImport },
  { label: 'Registrar salida', description: 'Retiro de materiales', to: SALIDAS_PATH, icon: IconPackageExport },
  { label: 'Revisar solicitudes', description: 'Aprobaciones pendientes', to: SOLICITUDES_REVISION_PATH, icon: IconClipboardCheck },
  { label: 'Alertas de reposición', description: 'Existencias críticas', to: ALERTAS_REPOSICION_PATH, icon: IconAlertTriangle },
  { label: 'Reposiciones', description: 'Compras y seguimiento', to: REPOSICIONES_PATH, icon: IconBox },
  { label: 'Recepciones', description: 'Material por recibir', to: RECEPCIONES_PATH, icon: IconPackageOff },
  { label: 'Historial', description: 'Movimientos de inventario', to: MOVIMIENTOS_PATH, icon: IconArrowsExchange },
  { label: 'Reportes', description: 'Indicadores y análisis', to: REPORTES_INVENTARIO_PATH, icon: IconFileAnalytics },
  { label: 'Imprimir inventario', description: 'Listado para archivo', to: IMPRIMIR_INVENTARIO_PATH, icon: IconPrinter },
]

const plumberItems = [
  adminItems[0],
  adminItems[2],
  adminItems[5],
  { label: 'Mis solicitudes', description: 'Seguimiento de materiales', to: SOLICITUDES_MATERIALES_PATH, icon: IconClipboardCheck },
]

type InventarioModuleMenuProps = {
  inline?: boolean
}

export default function InventarioModuleMenu({ inline = false }: InventarioModuleMenuProps) {
  const { user } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [headerTarget, setHeaderTarget] = useState<HTMLElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isAdmin = normalizeInternalRole(user?.role) === InternalAdminRoleName.Administradora
  const items = isAdmin ? adminItems : plumberItems

  useEffect(() => {
    if (inline) {
      setHeaderTarget(null)
      return
    }
    const frame = window.requestAnimationFrame(() => {
      setHeaderTarget(document.querySelector<HTMLElement>('.inventory-module-menu-slot, .materials-admin__header, .material-tracking__header, .material-request__header, .material-detail__header, .gallery-admin__header'))
    })
    return () => window.cancelAnimationFrame(frame)
  }, [inline, location.pathname])

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  const menu = (
    <div ref={containerRef} className={`inventory-module-menu${inline ? ' !static !inset-auto !m-0 !w-full !max-w-none !justify-stretch' : ''}`}>
      <button
        type="button"
        className={`group flex min-h-[52px] items-center justify-between gap-3 !rounded-2xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:!border-blue-300 hover:!bg-blue-50/70 hover:shadow-[0_10px_24px_rgba(37,99,235,0.12)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-600 motion-reduce:transform-none motion-reduce:transition-none${inline ? ' !w-full' : ''}`}
        aria-expanded={open}
        aria-controls="inventory-module-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="inventory-module-menu__trigger-label">
          <span className="inventory-module-menu__trigger-icon">
            <IconLayoutGrid className="transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 motion-reduce:transform-none" size={18} aria-hidden="true" />
          </span>
          Operaciones
        </span>
        <IconChevronDown
          className={`inventory-module-menu__chevron${open ? ' inventory-module-menu__chevron--open' : ''}`}
          size={18}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <nav
          id="inventory-module-menu"
          aria-label="Módulos de inventario"
        >
          <div className="border-b border-slate-100 px-3 pb-3 pt-1">
            <strong className="block text-sm text-slate-900">Gestión de inventario</strong>
            <span className="text-xs text-slate-500">Seleccione la operación que desea realizar.</span>
          </div>
          <div className="grid gap-1.5 pt-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(({ label, description, to, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex min-h-16 items-center gap-3 rounded-2xl p-3 no-underline transition ${active ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700'}`}
                >
                  <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${active ? 'bg-blue-600 text-white' : 'bg-sky-50 text-blue-600 group-hover:bg-blue-100'}`}>
                    <Icon size={20} stroke={1.8} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <strong className="block truncate text-sm">{label}</strong>
                    <small className="block truncate text-[11px] text-slate-500">{description}</small>
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      ) : null}
    </div>
  )

  if (inline) return menu
  if (!headerTarget) return null
  return createPortal(menu, headerTarget)
}
