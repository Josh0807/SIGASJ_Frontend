const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export function getBackendOrigin(): string {
  const explicit = import.meta.env?.VITE_BACKEND_URL?.trim()
  if (explicit) return trimTrailingSlash(explicit)

  const apiUrl = import.meta.env?.VITE_API_URL?.trim() || 'http://localhost:3000/api/v1'
  try {
    return new URL(apiUrl, window.location.origin).origin
  } catch {
    return 'http://localhost:3000'
  }
}

/** Convierte solamente recursos del Backend; conserva assets de Vite y URLs externas. */
export function resolveBackendAssetUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const path = value.trim().replace(/\\/g, '/')
  if (!path || path === 'null' || path === 'undefined') return undefined
  if (/^(https?:|data:|blob:)/i.test(path)) return path
  if (!/^\/?(?:api\/v1\/)?uploads\//i.test(path)) return path
  return `${getBackendOrigin()}${path.startsWith('/') ? path : `/${path}`}`
}
