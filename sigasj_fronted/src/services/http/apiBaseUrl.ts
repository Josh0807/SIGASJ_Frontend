const API_PREFIX = '/api/v1'

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

/** Acepta el origen de Render o la base completa y deja siempre `/api/v1`. */
export function normalizeApiBaseUrl(value: string): string {
  const trimmed = value.trim()
  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    throw new Error(
      'VITE_API_URL debe ser una URL absoluta, por ejemplo https://<servicio>.onrender.com/api/v1.',
    )
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('VITE_API_URL debe usar HTTP o HTTPS.')
  }

  const path = url.pathname.replace(/\/+$/, '')
  if (path === '' || path === '/') url.pathname = API_PREFIX
  else if (path === '/api') url.pathname = API_PREFIX
  else url.pathname = path

  url.search = ''
  url.hash = ''
  return trimTrailingSlash(url.toString())
}

/** En el build de producción la API tiene que ser la URL HTTPS configurada en Vercel. */
export function requireProductionApiBaseUrl(value: string | undefined): string {
  const trimmed = value?.trim()
  if (!trimmed) {
    throw new Error(
      'Falta VITE_API_URL. En Vercel defínala con la URL HTTPS de la API en Render, por ejemplo https://<servicio>.onrender.com/api/v1.',
    )
  }

  const normalized = normalizeApiBaseUrl(trimmed)
  if (!normalized.startsWith('https://')) {
    throw new Error('En producción VITE_API_URL debe ser HTTPS.')
  }
  return normalized
}
