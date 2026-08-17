/** Roles internos con acceso al panel administrativo. */
export const INTERNAL_ADMIN_ROLES = [
  'Administradora',
  'Secretaria',
  'Fontanero',
] as const

export type InternalAdminRole = (typeof INTERNAL_ADMIN_ROLES)[number]

export type AuthUser = {
  rol: string
  idUsuario: number
}

export type AuthSession = {
  accessToken: string
  user: AuthUser
}
