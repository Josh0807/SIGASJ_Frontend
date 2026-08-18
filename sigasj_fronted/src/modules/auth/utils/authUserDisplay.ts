import type { AuthUser } from '../types/authUser'

const isPresent = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

export const getAuthUserDisplayName = (user: AuthUser | null): string | undefined => {
  if (!user) {
    return undefined
  }

  const fullName = [user.name, user.lastName]
    .filter(isPresent)
    .map((part) => part.trim())
    .join(' ')

  if (fullName) {
    return fullName
  }

  if (isPresent(user.name)) {
    return user.name.trim()
  }

  if (isPresent(user.email)) {
    return user.email.trim()
  }

  return undefined
}

export const formatAuthUserRole = (role: string): string => {
  const trimmed = role.trim()

  if (!trimmed) {
    return ''
  }

  const normalized = trimmed.replace(/_/g, ' ').toLowerCase()
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export const getAuthUserRoleLabel = (user: AuthUser | null): string | undefined => {
  if (!user || !isPresent(user.role)) {
    return undefined
  }

  return formatAuthUserRole(user.role)
}

export const getAuthUserAvatarUrl = (user: AuthUser | null): string | undefined => {
  if (!user || !isPresent(user.avatar)) {
    return undefined
  }

  const trimmed = user.avatar.trim()

  if (trimmed === 'null' || trimmed === 'undefined') {
    return undefined
  }

  return trimmed
}

export const getAuthUserInitials = (displayName: string): string => {
  const words = displayName.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return 'SG'
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase()
}
