import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { ApiError } from './ApiError'
import { getApiBaseUrl } from './config'
import { extractHttpErrorMessage } from './extractHttpErrorMessage'

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

function messageFromAxiosData(data: unknown): string | null {
  if (typeof data === 'string') {
    return extractHttpErrorMessage(data)
  }

  if (data && typeof data === 'object') {
    return extractHttpErrorMessage(JSON.stringify(data))
  }

  return null
}

function isCanceled(error: unknown): boolean {
  return axios.isCancel(error) || (error instanceof AxiosError && error.code === 'ERR_CANCELED')
}

function httpErrorMessage(kind: 'query' | 'command'): string {
  return kind === 'query'
    ? 'El servidor respondió con un error al consultar los datos.'
    : 'El servidor respondió con un error al procesar la solicitud.'
}

function toApiError(error: unknown, kind: 'query' | 'command'): never {
  if (isCanceled(error)) {
    throw error
  }

  if (error instanceof ApiError) {
    throw error
  }

  if (error instanceof AxiosError) {
    if (error.response) {
      const extracted = messageFromAxiosData(error.response.data)
      throw new ApiError(
        extracted ?? httpErrorMessage(kind),
        'HTTP',
        error.response.status,
      )
    }

    const message = error.message.toLowerCase()
    if (message.includes('json') || error.code === 'ERR_BAD_RESPONSE') {
      throw new ApiError(
        'La respuesta del servidor no tiene un formato válido.',
        'PARSE',
      )
    }

    throw new ApiError(
      'No fue posible comunicarse con el servidor.',
      'NETWORK',
    )
  }

  throw new ApiError(
    'No fue posible comunicarse con el servidor.',
    'NETWORK',
  )
}

function buildConfig(options: {
  method?: string
  token?: string | null
  signal?: AbortSignal
  data?: unknown
  contentType?: string
}): AxiosRequestConfig {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (options.contentType) {
    headers['Content-Type'] = options.contentType
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  return {
    baseURL: getApiBaseUrl(),
    method: options.method ?? 'GET',
    headers,
    data: options.data,
    signal: options.signal,
  }
}

export async function fetchJson<T>(
  path: string,
  options: { signal?: AbortSignal } = {},
): Promise<T> {
  try {
    const response = await axios.request<T>({
      ...buildConfig({ method: 'GET', signal: options.signal }),
      url: path,
    })

    return response.data
  } catch (error) {
    toApiError(error, 'query')
  }
}

export async function requestJson<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  try {
    const response = await axios.request<T>({
      ...buildConfig({
        method: options.method ?? 'GET',
        token: options.token,
        signal: options.signal,
        data: options.body,
        contentType: 'application/json',
      }),
      url: path,
    })

    return response.data
  } catch (error) {
    toApiError(error, 'command')
  }
}

export async function requestFormData<T>(
  path: string,
  formData: FormData,
  options: FormDataRequestOptions = {},
): Promise<T> {
  try {
    const response = await axios.request<T>({
      ...buildConfig({
        method: options.method ?? 'POST',
        token: options.token,
        signal: options.signal,
        data: formData,
      }),
      url: path,
    })

    return response.data
  } catch (error) {
    toApiError(error, 'command')
  }
}

export async function requestVoid(
  path: string,
  options: RequestOptions = {},
): Promise<void> {
  try {
    await axios.request({
      ...buildConfig({
        method: options.method ?? 'DELETE',
        token: options.token,
        signal: options.signal,
        data: options.body,
        contentType: options.body === undefined ? undefined : 'application/json',
      }),
      url: path,
    })
  } catch (error) {
    toApiError(error, 'command')
  }
}
