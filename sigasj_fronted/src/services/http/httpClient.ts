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

  const bodyIsFormData = restOptions.body instanceof FormData
  if (!bodyIsFormData && !headers['Content-Type'] && !headers['content-type']) {
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
        detail = parsed.message || parsed.error || errorBody
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
