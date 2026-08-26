import type { TransparencyPublication } from './TransparencySectionProps'
import { transparencyMocks } from './transparencyMocks'

export type PublicTransparenciaQueryStatus = 'loading' | 'success' | 'error'

type UsePublicTransparenciaResult = {
  status: PublicTransparenciaQueryStatus
  publications: TransparencyPublication[]
  total: number
  retry: () => void
}

/**
 * Entrega publicaciones de ejemplo para la sección pública.
 */
export function usePublicTransparencia(
  enabled: boolean,
): UsePublicTransparenciaResult {
  const publications = enabled ? transparencyMocks : []

  return {
    status: 'success',
    publications,
    total: publications.length,
    retry: () => {},
  }
}
