import type { AdminNavIconName } from '../admin/AdminNavIcon'
import type { InternalAdminRole } from './auth.types'

/**
 * Permisos SIGASJ (`recurso.accion`) asignados por rol interno.
 * Fuente: docs/SIGASJ_AUTHORIZATION_MODEL.md
 *
 * Para agregar un rol:
 * 1. Decláralo en INTERNAL_ADMIN_ROLES (auth.types.ts)
 * 2. Asigna permisos aquí
 * 3. Actualiza allowedRoles en ADMIN_MODULE_ACCESS
 */
export const ROLE_PERMISSIONS: Record<InternalAdminRole, readonly string[]> = {
  Administradora: [
    'subscribers.read',
    'subscribers.create',
    'subscribers.update',
    'subscribers.deactivate',
    'announcements.manage',
    'fault_reports.read',
    'fault_reports.assign',
    'fault_reports.update_status',
    'institutional_content.manage',
    'projects.manage',
    'users.manage',
    'roles.manage',
    'audit.read',
  ],
  Secretaria: [
    'subscribers.read',
    'subscribers.create',
    'subscribers.update',
    'announcements.manage',
    'fault_reports.read',
    'fault_reports.assign',
    'fault_reports.update_status',
    'institutional_content.manage',
    'projects.manage',
  ],
  Fontanero: ['fault_reports.read', 'fault_reports.update_status'],
}

export type AdminModuleAccessDefinition = {
  segment: AdminNavIconName
  title: string
  allowedRoles: readonly InternalAdminRole[]
  /** Permisos mínimos exigidos; deben estar incluidos en ROLE_PERMISSIONS del rol. */
  requiredPermissions: readonly string[]
  availableInNav: boolean
}

/**
 * Configuración centralizada: segmento, título, icono (segment), roles y permisos.
 * Ampliar el menú agregando entradas aquí y el elemento en privateRoutes.tsx.
 */
export const ADMIN_MODULE_ACCESS: AdminModuleAccessDefinition[] = [
  {
    segment: 'dashboard',
    title: 'Dashboard',
    allowedRoles: ['Administradora', 'Secretaria', 'Fontanero'],
    requiredPermissions: [],
    availableInNav: true,
  },
  {
    segment: 'usuarios',
    title: 'Gestión de usuarios',
    allowedRoles: ['Administradora'],
    requiredPermissions: ['users.manage'],
    availableInNav: true,
  },
  {
    segment: 'abonados',
    title: 'Gestión de abonados',
    allowedRoles: ['Administradora', 'Secretaria'],
    requiredPermissions: ['subscribers.read'],
    availableInNav: true,
  },
  {
    segment: 'inventario',
    title: 'Gestión de inventario',
    allowedRoles: ['Administradora', 'Secretaria'],
    requiredPermissions: ['subscribers.read'],
    availableInNav: true,
  },
  {
    segment: 'solicitudes',
    title: 'Gestión de solicitudes',
    allowedRoles: ['Administradora', 'Secretaria'],
    requiredPermissions: ['subscribers.read'],
    availableInNav: true,
  },
  {
    segment: 'lecturas',
    title: 'Gestión de lecturas',
    allowedRoles: ['Administradora', 'Secretaria'],
    requiredPermissions: ['subscribers.read'],
    availableInNav: true,
  },
  {
    segment: 'averias',
    title: 'Gestión de averías',
    allowedRoles: ['Administradora', 'Secretaria', 'Fontanero'],
    requiredPermissions: ['fault_reports.read'],
    availableInNav: true,
  },
  {
    segment: 'reportes',
    title: 'Gestión de reportes',
    allowedRoles: ['Administradora'],
    requiredPermissions: ['audit.read'],
    availableInNav: true,
  },
  {
    segment: 'galeria',
    title: 'Galería de fotografías',
    allowedRoles: ['Administradora', 'Secretaria'],
    requiredPermissions: ['institutional_content.manage'],
    availableInNav: true,
  },
  {
    segment: 'transparencia',
    title: 'Transparencia y calidad del agua',
    allowedRoles: ['Administradora', 'Secretaria'],
    requiredPermissions: ['institutional_content.manage'],
    availableInNav: true,
  },
]

export const ADMIN_MODULE_ACCESS_BY_SEGMENT = Object.fromEntries(
  ADMIN_MODULE_ACCESS.map((module) => [module.segment, module]),
) as Record<AdminNavIconName, AdminModuleAccessDefinition>
