import { ApiError } from '../api/ApiError'
import { getApiBaseUrl } from './config'

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string | null
  signal?: AbortSignal
}

type FormDataRequestOptions = {
  method?: string
  token?: string | null
  signal?: AbortSignal
}

function buildUrl(path: string): string {
  return `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
}

function buildHeaders(token?: string | null, contentType?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (contentType) {
    headers['Content-Type'] = contentType
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) {
    return undefined as T
  }

  try {
    return JSON.parse(text) as T
  } catch {
    throw new ApiError(
      'La respuesta del servidor no tiene un formato válido.',
      'PARSE',
    )
  }
}

async function request(
  path: string,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(buildUrl(path), init)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    throw new ApiError(
      'No fue posible comunicarse con el servidor.',
      'NETWORK',
    )
  }
}

export async function fetchJson<T>(
  path: string,
  options: { signal?: AbortSignal } = {},
): Promise<T> {
  const response = await request(path, {
    method: 'GET',
    headers: buildHeaders(),
    signal: options.signal,
  })

  if (!response.ok) {
    throw new ApiError(
      'El servidor respondió con un error al consultar los datos.',
      'HTTP',
      response.status,
    )
  }

  return parseResponse<T>(response)
}

export async function requestJson<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await request(path, {
    method: options.method ?? 'GET',
    headers: buildHeaders(options.token, 'application/json'),
    body:
      options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  })

  if (!response.ok) {
    throw new ApiError(
      'El servidor respondió con un error al procesar la solicitud.',
      'HTTP',
      response.status,
    )
  }

  return parseResponse<T>(response)
}

export async function requestFormData<T>(
  path: string,
  formData: FormData,
  options: FormDataRequestOptions = {},
): Promise<T> {
  const response = await request(path, {
    method: options.method ?? 'POST',
    headers: buildHeaders(options.token),
    body: formData,
    signal: options.signal,
  })

  if (!response.ok) {
    throw new ApiError(
      'El servidor respondió con un error al procesar la solicitud.',
      'HTTP',
      response.status,
    )
  }

  return parseResponse<T>(response)
}

export async function requestVoid(
  path: string,
  options: RequestOptions = {},
): Promise<void> {
  const response = await request(path, {
    method: options.method ?? 'DELETE',
    headers: buildHeaders(options.token, 'application/json'),
    body:
      options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  })

  if (!response.ok) {
    throw new ApiError(
      'El servidor respondió con un error al procesar la solicitud.',
      'HTTP',
      response.status,
    )
  }
}
