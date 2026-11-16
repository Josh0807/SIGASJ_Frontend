/** Valores persistidos en `Rol.nombre` / JWT (alineados al backend). */
export const USUARIO_ROLE_VALUES = [
  'SUPER_ADMIN',
  'ADMINISTRADORA',
  'SECRETARIA',
  'FONTANERO',
  'ABONADO',
  'AYUDANTE',
] as const

export type UsuarioRoleValue = (typeof USUARIO_ROLE_VALUES)[number]

export const USUARIO_ROLE_LABELS: Record<UsuarioRoleValue, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMINISTRADORA: 'Administradora',
  SECRETARIA: 'Secretaria Ejecutiva',
  FONTANERO: 'Fontanero',
  ABONADO: 'Abonado',
  AYUDANTE: 'Ayudante',
}

/** Roles asignables desde Gestión de usuarios (panel). */
export const USUARIO_ASSIGNABLE_ROLES: readonly UsuarioRoleValue[] = [
  'SUPER_ADMIN',
  'ADMINISTRADORA',
  'SECRETARIA',
  'FONTANERO',
  'AYUDANTE',
]

export type UsuarioAdmin = {
  id: number
  nombre: string
  correo: string
  activo: boolean
  rol: UsuarioRoleValue | string
}

export type UsuariosListResponse = {
  data: UsuarioAdmin[]
}

export type CreateUsuarioPayload = {
  nombre: string
  correo: string
  password: string
  rol: UsuarioRoleValue
  activo?: boolean
}

export type UpdateUsuarioPayload = {
  nombre?: string
  password?: string
  rol?: UsuarioRoleValue
  activo?: boolean
}
