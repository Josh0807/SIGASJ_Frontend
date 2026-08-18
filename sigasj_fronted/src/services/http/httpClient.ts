import { getAccessToken } from '../../modules/auth/utils/authStorage'

const getApiBaseUrl = (): string => {
  return import.meta.env?.VITE_API_URL ?? '/api'
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
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

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
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  }

  if (token?.trim()) {
    headers.Authorization = `Bearer ${token.trim()}`
  }

  const response = await fetch(url, {
    ...restOptions,
    headers,
  })

  if (!response.ok) {
    throw new Error(
      `Error en solicitud HTTP ${response.status}: ${response.statusText || 'Respuesta no exitosa'}`,
    )
  }

  // Manejar respuestas vacías (204 No Content)
  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}
