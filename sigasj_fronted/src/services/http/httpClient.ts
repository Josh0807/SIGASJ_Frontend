import { getAccessToken } from '../../modules/auth/utils/authStorage'

/**
 * En Vite (dev) usa el proxy same-origin `/api` → localhost:3000.
 * Evita "Failed to fetch" al abrir el front por IP de red o por IPv6 localhost.
 */
const getApiBaseUrl = (): string => {
  if (import.meta.env.DEV) {
    return '/api/v1'
  }
  return import.meta.env?.VITE_API_URL?.trim() || 'http://localhost:3000/api/v1'
}



export type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>
}

/**
 * Cliente HTTP autenticado centralizado para consumir endpoints privados y públicos.
 * Incluye automáticamente el token de autorización 'Authorization: Bearer <token>' cuando existe.
 */
export async function fetchWithAuth<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { params, headers: customHeaders, ...restOptions } = options
  const baseUrl = getApiBaseUrl().replace(/\/$/, '')
  let formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  if (baseUrl.endsWith('/v1') && formattedEndpoint.startsWith('/v1/')) {
    formattedEndpoint = formattedEndpoint.substring(3)
  }
  if (baseUrl.endsWith('/api') && formattedEndpoint.startsWith('/api/')) {
    formattedEndpoint = formattedEndpoint.substring(4)
  }

  let url = `${baseUrl}${formattedEndpoint}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  const token = getAccessToken()
  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  }

  if (!(restOptions.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token?.trim()) {
    headers.Authorization = `Bearer ${token.trim()}`
  }

  const response = await fetch(url, {
    ...restOptions,
    headers,
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    let detail = response.statusText || 'Respuesta no exitosa'
    if (errorBody) {
      try {
        const parsed = JSON.parse(errorBody)
        const backendMessage = parsed.message || parsed.error
        detail = Array.isArray(backendMessage)
          ? JSON.stringify(backendMessage)
          : backendMessage || errorBody
      } catch {
        detail = errorBody.slice(0, 150)
      }
    }
    throw new Error(`HTTP ${response.status}: ${detail}`)
  }


  // Manejar respuestas vacías (204 No Content)
  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}
