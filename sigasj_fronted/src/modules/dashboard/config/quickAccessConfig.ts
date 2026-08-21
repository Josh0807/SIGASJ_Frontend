import type { AdminNavIconName } from '../../admin-panel/components/AdminNavIcon'

export type QuickAccessConfigItem = {
  id: string
  title: string
  description: string
  path: string
  icon: AdminNavIconName
  badgeText?: string
}

/**
 * Catálogo general de accesos rápidos del sistema.
 */
export const ALL_QUICK_ACCESS_ITEMS: QuickAccessConfigItem[] = [
  {
    id: 'usuarios',
    title: 'Usuarios y roles',
    description: 'Administrar accesos, roles y personal del sistema.',
    path: '/admin/usuarios',
    icon: 'usuarios',
  },
  {
    id: 'abonados',
    title: 'Padrón de abonados',
    description: 'Consultar padrón, contratos e historial de abonados.',
    path: '/admin/abonados',
    icon: 'abonados',
  },
  {
    id: 'lecturas',
    title: 'Lecturas de medidores',
    description: 'Ingresar y revisar consumo de medidores por sector.',
    path: '/admin/lecturas',
    icon: 'lecturas',
  },
  {
    id: 'averias',
    title: 'Reportes de averías',
    description: 'Atender reportes de fuga y mantenimiento de red.',
    path: '/admin/averias',
    icon: 'averias',
  },
  {
    id: 'comunicados',
    title: 'Gestión de comunicados',
    description: 'Publicar y actualizar avisos oficiales de la ASADA.',
    path: '/admin/comunicados',
    icon: 'comunicados',
  },
  {
    id: 'galeria',
    title: 'Galería de fotos',
    description: 'Gestionar imágenes para el portal web institucional.',
    path: '/admin/galeria',
    icon: 'galeria',
  },
  {
    id: 'contacto',
    title: 'Contacto y ubicación',
    description: 'Actualizar teléfono, correo, horario y mapa público.',
    path: '/admin/contacto',
    icon: 'contacto',
  },
  {
    id: 'transparencia',
    title: 'Informes de transparencia',
    description: 'Publicar informes de calidad del agua y rendición.',
    path: '/admin/transparencia',
    icon: 'transparencia',
  },
  {
    id: 'reportes',
    title: 'Estadísticas y reportes',
    description: 'Generar estadísticas globales y estados financieros.',
    path: '/admin/reportes',
    icon: 'reportes',
  },
]

/**
 * Filtra los accesos rápidos permitiendo únicamente las rutas disponibles / autorizadas.
 * @param allowedPaths Rutas permitidas del sistema (ej: de ADMIN_NAV_ITEMS). Si es omitido, devuelve todos.
 */
export const getAuthorizedQuickAccessItems = (
  allowedPaths?: string[],
): QuickAccessConfigItem[] => {
  if (!allowedPaths || allowedPaths.length === 0) {
    return ALL_QUICK_ACCESS_ITEMS
  }

  return ALL_QUICK_ACCESS_ITEMS.filter((item) => allowedPaths.includes(item.path))
}
