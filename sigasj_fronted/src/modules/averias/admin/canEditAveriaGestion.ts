import {
  InternalAdminRoleName,
  type InternalAdminRole,
} from '../../auth/utils/internalRoles'
import {
  userHasAllowedRole,
  userHasPermissions,
} from '../../auth/utils/adminNavigation'
import type { AuthUser } from '../../auth/types/authUser'

const AVERIA_GESTION_ALLOWED_ROLES: readonly InternalAdminRole[] = [
  InternalAdminRoleName.Administradora,
  InternalAdminRoleName.Secretaria,
]

const AVERIA_GESTION_PERMISSIONS = ['fault_reports.update_status'] as const

export function canEditAveriaGestion(user: AuthUser | null): boolean {
  if (!user) {
    return false
  }

  return (
    userHasAllowedRole(user, AVERIA_GESTION_ALLOWED_ROLES) &&
    userHasPermissions(user, AVERIA_GESTION_PERMISSIONS)
  )
}
