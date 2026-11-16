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
const ADMINISTRADORA_OPERATIVE_PERMISSIONS = [
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
  'audit.read',
  'activities.read_all',
  'activities.review',
  'inventory.read',
  'staff.manage',
] as const

export const ROLE_PERMISSIONS: Record<InternalAdminRole, readonly string[]> = {
  [InternalAdminRoleName.SuperAdmin]: [
    ...ADMINISTRADORA_OPERATIVE_PERMISSIONS,
    'activities.register',
    'activities.read_own',
    'users.manage',
    'roles.manage',
  ],
  [InternalAdminRoleName.Administradora]: [...ADMINISTRADORA_OPERATIVE_PERMISSIONS],
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
    'inventory.read',
    'staff.manage',
  ],
  [InternalAdminRoleName.Fontanero]: [
    'fault_reports.read',
    'fault_reports.update_status',
    'activities.register',
    'activities.read_own',
    'inventory.read',
  ],
}

export type AdminModuleAccessDefinition = {
  segment: AdminNavIconName
  title: string
  allowedRoles: readonly InternalAdminRole[]
  /** Permisos mínimos exigidos; deben estar incluidos en ROLE_PERMISSIONS del rol. */
  requiredPermissions: readonly string[]
  availableInNav: boolean
  /** Si es false, la ruta no se registra ni se puede abrir (stubs). Default: true. */
  availableAsRoute?: boolean
}

const withSuperAdmin = (
  roles: readonly InternalAdminRole[],
): readonly InternalAdminRole[] =>
  roles.includes(InternalAdminRoleName.SuperAdmin)
    ? roles
    : [InternalAdminRoleName.SuperAdmin, ...roles]

/**
 * Configuración centralizada: segmento, título, icono (segment), roles y permisos.
 * Ampliar el menú agregando entradas aquí y el elemento en privateRoutes.tsx.
 */
export const ADMIN_MODULE_ACCESS: AdminModuleAccessDefinition[] = [
  {
    segment: 'dashboard',
    title: 'Dashboard',
    allowedRoles: withSuperAdmin([
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
      InternalAdminRoleName.Fontanero,
    ]),
    requiredPermissions: [],
    availableInNav: true,
  },
  {
    segment: 'usuarios',
    title: 'Gestión de usuarios',
    allowedRoles: [InternalAdminRoleName.SuperAdmin],
    requiredPermissions: ['users.manage'],
    availableInNav: true,
    availableAsRoute: true,
  },
  {
    segment: 'abonados',
    title: 'Gestión de asociados',
    // Abonado no está aquí: no ve el padrón ni entra por URL. No hay pantallas personales en este módulo.
    allowedRoles: withSuperAdmin([
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
    ]),
    requiredPermissions: ['subscribers.read'],
    availableInNav: true,
  },
  {
    segment: 'inventario',
    title: 'Inventario',
    allowedRoles: withSuperAdmin([
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
      InternalAdminRoleName.Fontanero,
    ]),
    requiredPermissions: ['inventory.read'],
    availableInNav: true,
  },
  {
    segment: 'solicitudes',
    title: 'Gestión de solicitudes',
    // Alineado con BE: Admin + Sec mutan estado; Fontanero solo lectura vía API (sin nav).
    allowedRoles: withSuperAdmin([
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
    ]),
    requiredPermissions: [],
    availableInNav: true,
  },
  {
    segment: 'rrhh',
    title: 'Recursos Humanos',
    allowedRoles: withSuperAdmin([
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
    ]),
    requiredPermissions: ['staff.manage'],
    availableInNav: true,
  },
  {
    segment: 'averias',
    title: 'Gestión de averías',
    allowedRoles: withSuperAdmin([
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
    ]),
    requiredPermissions: ['fault_reports.read'],
    availableInNav: true,
  },
  {
    segment: 'mapa-red',
    title: 'Mapa de la red de agua',
    allowedRoles: withSuperAdmin([
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
    ]),
    requiredPermissions: ['fault_reports.read'],
    // Vive embebido en el dashboard; no se publica como módulo del menú.
    availableInNav: false,
  },
  {
    segment: 'actividades',
    title: 'Actividades',
    allowedRoles: withSuperAdmin([InternalAdminRoleName.Fontanero]),
    requiredPermissions: ['activities.register'],
    availableInNav: true,
  },
  {
    segment: 'actividades-fontanero',
    title: 'Actividades del Fontanero',
    allowedRoles: withSuperAdmin([InternalAdminRoleName.Administradora]),
    requiredPermissions: ['activities.read_all'],
    availableInNav: true,
  },
  {
    segment: 'reportes',
    title: 'Gestión de reportes',
    allowedRoles: withSuperAdmin([InternalAdminRoleName.Administradora]),
    requiredPermissions: ['audit.read'],
    // Stub sin UI: no se publica en menú ni como ruta funcional.
    availableInNav: false,
    availableAsRoute: false,
  },
  {
    segment: 'proyectos',
    title: 'Gestión de Proyectos',
    allowedRoles: withSuperAdmin([InternalAdminRoleName.Administradora]),
    requiredPermissions: ['projects.manage'],
    availableInNav: true,
  },
  {
    segment: 'galeria',
    title: 'Galería de fotografías',
    allowedRoles: withSuperAdmin([
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
    ]),
    requiredPermissions: ['institutional_content.manage'],
    availableInNav: true,
  },
  {
    segment: 'comunicados',
    title: 'Gestión de Comunicados',
    allowedRoles: withSuperAdmin([
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
    ]),
    requiredPermissions: ['announcements.manage'],
    availableInNav: true,
  },
  {
    segment: 'contacto',
    title: 'Información de Contacto y Ubicación',
    allowedRoles: withSuperAdmin([
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
    ]),
    requiredPermissions: ['institutional_content.manage'],
    availableInNav: true,
  },
  {
    segment: 'transparencia',
    title: 'Transparencia y calidad del agua',
    allowedRoles: withSuperAdmin([
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
    ]),
    requiredPermissions: ['institutional_content.manage'],
    availableInNav: true,
  },
  {
    segment: 'perfil',
    title: 'Mi perfil',
    allowedRoles: withSuperAdmin([
      InternalAdminRoleName.Administradora,
      InternalAdminRoleName.Secretaria,
      InternalAdminRoleName.Fontanero,
    ]),
    requiredPermissions: [],
    availableInNav: false,
  },
]

export const ADMIN_MODULE_ACCESS_BY_SEGMENT = Object.fromEntries(
  ADMIN_MODULE_ACCESS.map((module) => [module.segment, module]),
) as Record<AdminNavIconName, AdminModuleAccessDefinition>

/** Roles del grupo de rutas de Gestión de asociados (fuente única para el guard). */
export const ABONADOS_ALLOWED_ROLES =
  ADMIN_MODULE_ACCESS_BY_SEGMENT.abonados.allowedRoles
