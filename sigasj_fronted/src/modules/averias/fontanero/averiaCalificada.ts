const PRIORIDADES = new Set(['BAJA', 'MEDIA', 'ALTA'])
const TIPOS = new Set(['TUBO_MADRE', 'TUBO_MEDIDOR'])

export function averiaCalificadaParaAtencion(
  prioridad: string | null | undefined,
  tipoAveria: string | null | undefined,
): boolean {
  const prioridadNormalizada = prioridad?.trim().toUpperCase() ?? ''
  const tipoNormalizado = tipoAveria?.trim().toUpperCase() ?? ''
  return PRIORIDADES.has(prioridadNormalizada) && TIPOS.has(tipoNormalizado)
}
