import { ApiError } from './ApiError'

/** URL base del Back-end (sin barra final). Requiere VITE_API_BASE_URL. */
export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!base) {
    throw new ApiError(
      'La URL base de la API no está configurada.',
      'CONFIG',
    )
  }

  return base.replace(/\/$/, '')
}

/**
 * Ruta pública de comunicados relativa a la base.
 * Se puede sobrescribir con VITE_PUBLIC_ANNOUNCEMENTS_PATH cuando el backend la defina.
 */
export function getPublicAnnouncementsPath(): string {
  const path = import.meta.env.VITE_PUBLIC_ANNOUNCEMENTS_PATH?.trim() || '/comunicados'
  return path.startsWith('/') ? path : `/${path}`
}

/** Ruta pública de la galería relativa a la base. */
export function getPublicGalleryPath(): string {
  const path =
    import.meta.env.VITE_PUBLIC_GALLERY_PATH?.trim() || '/api/public/galeria'
  return path.startsWith('/') ? path : `/${path}`
}
