import { ApiError } from './ApiError'

/** URL base del Back-end (sin barra final). */
export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL
  // Vacío / ausente en DEV: same-origin + proxy de Vite → /api/...
  if (configured === undefined || configured.trim() === '') {
    if (import.meta.env.DEV) {
      return ''
    }

    throw new ApiError(
      'La URL base de la API no está configurada.',
      'CONFIG',
    )
  }

  return configured.trim().replace(/\/$/, '')
}

/**
 * Ruta pública de comunicados relativa a la base.
 * Se puede sobrescribir con VITE_PUBLIC_ANNOUNCEMENTS_PATH cuando el backend la defina.
 */
export function getPublicAnnouncementsPath(): string {
  const path = import.meta.env.VITE_PUBLIC_ANNOUNCEMENTS_PATH?.trim() || '/comunicados'
  return path.startsWith('/') ? path : `/${path}`
}
