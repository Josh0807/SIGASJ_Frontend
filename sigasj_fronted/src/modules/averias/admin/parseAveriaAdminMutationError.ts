import { extractHttpErrorMessage } from '../../actividades-fontanero/utils/httpErrorStatus'

const DEFAULT_MUTATION_ERROR =
  'No fue posible guardar el cambio. Intente nuevamente.'

export function parseAveriaAdminMutationError(
  error: unknown,
  fallback = DEFAULT_MUTATION_ERROR,
): string {
  return extractHttpErrorMessage(error, fallback)
}
