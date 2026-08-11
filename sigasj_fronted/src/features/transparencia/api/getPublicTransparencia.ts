import { getPublicTransparenciaPath } from '../../../shared/api/config'
import { fetchJson } from '../../../shared/api/http'
import {
  extractPublicTransparenciaPayload,
  mapPublicTransparenciaPublication,
  type PublicTransparenciaResponse,
} from './types'
import type { TransparencyPublication } from '../types'
import { ApiError } from '../../../shared/api/ApiError'

type GetPublicTransparenciaOptions = {
  signal?: AbortSignal
}

export type PublicTransparenciaResult = {
  publications: TransparencyPublication[]
  total: number
}

/**
 * Consulta las publicaciones públicas de transparencia.
 */
export async function getPublicTransparencia(
  options: GetPublicTransparenciaOptions = {},
): Promise<PublicTransparenciaResult> {
  const payload = await fetchJson<PublicTransparenciaResponse>(
    getPublicTransparenciaPath(),
    {
      signal: options.signal,
    },
  )

  if (payload === null || typeof payload !== 'object') {
    throw new ApiError(
      'La respuesta del servidor no contiene publicaciones válidas.',
      'PARSE',
    )
  }

  const rawItems = extractPublicTransparenciaPayload(payload)
  const publications = rawItems.flatMap((item) => {
    try {
      const mapped = mapPublicTransparenciaPublication(item)
      return mapped ? [mapped] : []
    } catch {
      return []
    }
  })

  const total =
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    typeof payload.total === 'number' &&
    Number.isFinite(payload.total)
      ? payload.total
      : publications.length

  return { publications, total }
}
