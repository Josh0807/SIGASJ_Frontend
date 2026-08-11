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

/** Ruta pública de la galería relativa a la base. */
export function getPublicGalleryPath(): string {
  const path =
    import.meta.env.VITE_PUBLIC_GALLERY_PATH?.trim() || '/api/public/galeria'
  return path.startsWith('/') ? path : `/${path}`
}

/** Ruta pública de transparencia relativa a la base. */
export function getPublicTransparenciaPath(): string {
  const path =
    import.meta.env.VITE_PUBLIC_TRANSPARENCIA_PATH?.trim() ||
    '/api/public/transparencia'
  return path.startsWith('/') ? path : `/${path}`
}

/** Ruta administrativa de la galería relativa a la base. */
export function getAdminGalleryPath(): string {
  const path =
    import.meta.env.VITE_ADMIN_GALLERY_PATH?.trim() || '/api/admin/galeria'
  return path.startsWith('/') ? path : `/${path}`
}

/** Ruta administrativa de transparencia relativa a la base. */
export function getAdminTransparenciaPath(): string {
  const path =
    import.meta.env.VITE_ADMIN_TRANSPARENCIA_PATH?.trim() ||
    '/api/admin/transparencia'
  return path.startsWith('/') ? path : `/${path}`
}
