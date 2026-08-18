import type { AuthUser } from '../types/authUser'

const INVALID_DISPLAY_VALUES = new Set(['null', 'undefined'])

const isPresent = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isDisplayString = (value: unknown): value is string => {
  if (!isPresent(value)) {
    return false
  }

  return !INVALID_DISPLAY_VALUES.has(value.trim().toLowerCase())
}

export const AUTH_USER_DISPLAY_NAME_FALLBACK = 'Usuario'

const buildNameFromParts = (user: AuthUser): string | undefined => {
  const fullName = [user.name, user.lastName]
    .filter(isDisplayString)
    .map((part) => part.trim())
    .join(' ')

  return fullName || undefined
}

export const getAuthUserDisplayName = (user: AuthUser | null | undefined): string | undefined => {
  if (!user) {
    return undefined
  }

  const fromName = buildNameFromParts(user)

  if (fromName) {
    return fromName
  }

  if (isDisplayString(user.email)) {
    return user.email.trim()
  }

  return undefined
}

export const resolveAuthUserDisplayName = (
  user: AuthUser | null | undefined,
): string => getAuthUserDisplayName(user) ?? AUTH_USER_DISPLAY_NAME_FALLBACK

/** Nombre visible en AdminHeader: solo name/lastName, sin email, id ni sesión. */
export const getAuthUserHeaderName = (
  user: AuthUser | null | undefined,
): string | undefined => {
  if (!user) {
    return undefined
  }

  return buildNameFromParts(user)
}

export const resolveAuthUserHeaderName = (
  user: AuthUser | null | undefined,
): string => getAuthUserHeaderName(user) ?? AUTH_USER_DISPLAY_NAME_FALLBACK

export const formatAuthUserRole = (role: string): string => {
  const trimmed = role.trim()

  if (!trimmed) {
    return ''
  }

  return trimmed
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const getAuthUserRoleLabel = (
  user: AuthUser | null | undefined,
): string | undefined => {
  if (!user || !isDisplayString(user.role)) {
    return undefined
  }

  const formattedRole = formatAuthUserRole(user.role)

  return formattedRole || undefined
}

export const getAuthUserAvatarUrl = (
  user: AuthUser | null | undefined,
): string | undefined => {
  if (!user || !isDisplayString(user.avatar)) {
    return undefined
  }

  return user.avatar.trim()
}

const UNSAFE_AVATAR_PATTERN =
  /(?:token|jwt|bearer|password|secret|sigasj_access)|^eyJ[A-Za-z0-9_-]*\.|^data:/i

const isSafeHeaderAvatarUrl = (url: string): boolean => {
  if (UNSAFE_AVATAR_PATTERN.test(url)) {
    return false
  }

  return url.startsWith('/') || /^https?:\/\//i.test(url)
}

/** Avatar seguro para AdminHeader: sin tokens, JWT ni URLs internas sospechosas. */
export const getAuthUserHeaderAvatarUrl = (
  user: AuthUser | null | undefined,
): string | undefined => {
  const avatarUrl = getAuthUserAvatarUrl(user)

  if (!avatarUrl || !isSafeHeaderAvatarUrl(avatarUrl)) {
    return undefined
  }

  return avatarUrl
}

export const getAuthUserInitials = (displayName: string): string => {
  const trimmed = displayName.trim()

  if (!trimmed || trimmed === AUTH_USER_DISPLAY_NAME_FALLBACK) {
    return 'US'
  }

  const words = trimmed.split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return 'US'
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase()
}
