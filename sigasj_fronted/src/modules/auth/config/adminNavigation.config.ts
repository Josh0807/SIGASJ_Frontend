import type { AdminNavIconName } from '../../admin-panel/components/AdminNavIcon'
import {
  InternalAdminRoleName,
  type InternalAdminRole,
} from '../utils/internalRoles'

/**
 * Permisos SIGASJ (`recurso.accion`) asignados por rol interno.
 * Fuente: docs/SIGASJ_AUTHORIZATION_MODEL.md
 *
 * Para agregar un rol:
 * 1. Decláralo en INTERNAL_ADMIN_ROLES (internalRoles.ts)
 * 2. Asigna permisos aquí
 * 3. Actualiza allowedRoles en ADMIN_MODULE_ACCESS
 */
export const ROLE_PERMISSIONS: Record<InternalAdminRole, readonly string[]> = {
  [InternalAdminRoleName.Administradora]: [
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
  [InternalAdminRoleName.Secretaria]: [
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
  [InternalAdminRoleName.Fontanero]: [
    'fault_reports.read',
    'fault_reports.update_status',
  ],
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
    allowedRoles: [
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
      InternalAdminRoleName.Fontanero,
    ],
    requiredPermissions: [],
    availableInNav: true,
  },
  {
    segment: 'usuarios',
    title: 'Gestión de usuarios',
    allowedRoles: [InternalAdminRoleName.Administradora],
    requiredPermissions: ['users.manage'],
    availableInNav: true,
  },
  {
    segment: 'abonados',
    title: 'Gestión de abonados',
    // Abonado no está aquí: no ve el padrón ni entra por URL. No hay pantallas personales en este módulo.
    allowedRoles: [
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
    ],
    requiredPermissions: ['subscribers.read'],
    availableInNav: true,
  },
  {
    segment: 'inventario',
    title: 'Gestión de inventario',
    allowedRoles: [
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
    ],
    requiredPermissions: ['subscribers.read'],
    availableInNav: true,
  },
  {
    segment: 'solicitudes',
    title: 'Gestión de solicitudes',
    allowedRoles: [
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
    ],
    requiredPermissions: ['subscribers.read'],
    availableInNav: true,
  },
  {
    segment: 'lecturas',
    title: 'Gestión de lecturas',
    allowedRoles: [
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
    ],
    requiredPermissions: ['subscribers.read'],
    availableInNav: true,
  },
  {
    segment: 'averias',
    title: 'Gestión de averías',
    allowedRoles: [
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
      InternalAdminRoleName.Fontanero,
    ],
    requiredPermissions: ['fault_reports.read'],
    availableInNav: true,
  },
  {
    segment: 'reportes',
    title: 'Gestión de reportes',
    allowedRoles: [InternalAdminRoleName.Administradora],
    requiredPermissions: ['audit.read'],
    availableInNav: true,
  },
  {
    segment: 'galeria',
    title: 'Galería de fotografías',
    allowedRoles: [
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
    ],
    requiredPermissions: ['institutional_content.manage'],
    availableInNav: true,
  },
  {
    segment: 'transparencia',
    title: 'Transparencia y calidad del agua',
    allowedRoles: [
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
    ],
    requiredPermissions: ['institutional_content.manage'],
    availableInNav: true,
  },
  {
    segment: 'perfil',
    title: 'Mi perfil',
    allowedRoles: [
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
      InternalAdminRoleName.Fontanero,
    ],
    requiredPermissions: [],
    availableInNav: false,
  },
]

export const ADMIN_MODULE_ACCESS_BY_SEGMENT = Object.fromEntries(
  ADMIN_MODULE_ACCESS.map((module) => [module.segment, module]),
) as Record<AdminNavIconName, AdminModuleAccessDefinition>

/** Roles del grupo de rutas de Gestión de Abonados (fuente única para el guard). */
export const ABONADOS_ALLOWED_ROLES =
  ADMIN_MODULE_ACCESS_BY_SEGMENT.abonados.allowedRoles
