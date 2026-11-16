/** Roles internos con acceso al panel administrativo. */
export const INTERNAL_ADMIN_ROLES = [
  'SuperAdmin',
  'Administradora',
  'Secretaria',
  'Fontanero',
] as const

export type InternalAdminRole = (typeof INTERNAL_ADMIN_ROLES)[number]

/** Acceso por nombre al rol interno. Evita literales dispersos en guards y menú. */
export const InternalAdminRoleName = {
  SuperAdmin: 'SuperAdmin',
  Administradora: 'Administradora',
  Secretaria: 'Secretaria',
  Fontanero: 'Fontanero',
} as const satisfies { readonly [K in InternalAdminRole]: K }

/** Aliases JWT/BD (UPPER_SNAKE) → rol interno del panel. */
const JWT_ROLE_ALIASES: Record<string, InternalAdminRole> = {
  super_admin: InternalAdminRoleName.SuperAdmin,
  superadmin: InternalAdminRoleName.SuperAdmin,
  administradora: InternalAdminRoleName.Administradora,
  secretaria: InternalAdminRoleName.Secretaria,
  fontanero: InternalAdminRoleName.Fontanero,
}

export function normalizeInternalRole(
  role: string | null | undefined,
): InternalAdminRole | null {
  if (!role?.trim()) {
    return null
  }

  const normalized = role.trim().toLowerCase()
  const compact = normalized.replace(/_/g, '')

  for (const internalRole of INTERNAL_ADMIN_ROLES) {
    if (internalRole.toLowerCase() === normalized || internalRole.toLowerCase() === compact) {
      return internalRole
    }
  }

  return JWT_ROLE_ALIASES[normalized] ?? JWT_ROLE_ALIASES[compact] ?? null
}

export function isInternalAdminRole(
  role: string | null | undefined,
): role is InternalAdminRole {
  return normalizeInternalRole(role) !== null
}

/** Rol de abonado: sin acceso al panel ni a Gestión de asociados administrativa. */
export const ABONADO_ROLE = 'Abonado' as const

export function isAbonadoRole(
  role: string | null | undefined,
): role is typeof ABONADO_ROLE {
  if (!role?.trim()) {
    return false
  }

  return role.trim().replace(/_/g, '').toLowerCase() === ABONADO_ROLE.toLowerCase()
}
