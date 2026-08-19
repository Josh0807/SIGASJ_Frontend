/** Roles internos con acceso al panel administrativo. */
export const INTERNAL_ADMIN_ROLES = [
  'Administradora',
  'Secretaria',
  'Fontanero',
] as const

export type InternalAdminRole = (typeof INTERNAL_ADMIN_ROLES)[number]

/** Acceso por nombre al rol interno. Evita literales dispersos en guards y menú. */
export const InternalAdminRoleName = {
  Administradora: 'Administradora',
  Secretaria: 'Secretaria',
  Fontanero: 'Fontanero',
} as const satisfies { readonly [K in InternalAdminRole]: K }

export function normalizeInternalRole(
  role: string | null | undefined,
): InternalAdminRole | null {
  if (!role?.trim()) {
    return null
  }

  const normalized = role.trim().toLowerCase()

  for (const internalRole of INTERNAL_ADMIN_ROLES) {
    if (internalRole.toLowerCase() === normalized) {
      return internalRole
    }
  }

  return null
}

export function isInternalAdminRole(
  role: string | null | undefined,
): role is InternalAdminRole {
  return normalizeInternalRole(role) !== null
}

/** Rol de abonado: sin acceso al panel ni a Gestión de Abonados administrativa. */
export const ABONADO_ROLE = 'Abonado' as const

export function isAbonadoRole(
  role: string | null | undefined,
): role is typeof ABONADO_ROLE {
  if (!role?.trim()) {
    return false
  }

  return role.trim().replace(/_/g, '').toLowerCase() === ABONADO_ROLE.toLowerCase()
}
