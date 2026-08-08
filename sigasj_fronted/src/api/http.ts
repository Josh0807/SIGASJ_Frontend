import { ApiError } from './ApiError'
import { getApiBaseUrl } from './config'

type FetchJsonOptions = {
  signal?: AbortSignal
}

export async function fetchJson<T>(path: string, options: FetchJsonOptions = {}): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`

  let response: Response

  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    throw new ApiError(
      'No fue posible comunicarse con el servidor.',
      'NETWORK',
    )
  }

  if (!response.ok) {
    throw new ApiError(
      'El servidor respondió con un error al consultar los datos.',
      'HTTP',
      response.status,
    )
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError(
      'La respuesta del servidor no tiene un formato válido.',
      'PARSE',
    )
  }
}
