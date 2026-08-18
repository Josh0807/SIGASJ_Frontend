/** Roles internos con acceso al panel administrativo. */
export const INTERNAL_ADMIN_ROLES = [
  'Administradora',
  'Secretaria',
  'Fontanero',
] as const

export type InternalAdminRole = (typeof INTERNAL_ADMIN_ROLES)[number]

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
