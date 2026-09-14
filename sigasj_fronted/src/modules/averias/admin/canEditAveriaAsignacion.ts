import type { AuthUser } from '../../auth/types/authUser'
import {
  userHasAllowedRole,
  userHasPermissions,
} from '../../auth/utils/adminNavigation'
import {
  InternalAdminRoleName,
  type InternalAdminRole,
} from '../../auth/utils/internalRoles'

const AVERIA_ASIGNACION_ALLOWED_ROLES: readonly InternalAdminRole[] = [
  InternalAdminRoleName.Administradora,
  InternalAdminRoleName.Secretaria,
]

const AVERIA_ASIGNACION_PERMISSIONS = ['fault_reports.assign'] as const

export function canEditAveriaAsignacion(user: AuthUser | null): boolean {
  if (!user) {
    return false
  }

  return (
    userHasAllowedRole(user, AVERIA_ASIGNACION_ALLOWED_ROLES) &&
    userHasPermissions(user, AVERIA_ASIGNACION_PERMISSIONS)
  )
}
