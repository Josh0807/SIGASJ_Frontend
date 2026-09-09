const DATOS_ESPECIFICOS_LABELS: Record<string, string> = {
  ubicacionFuga: 'Ubicación de la fuga',
  presionMedida: 'Presión medida',
  resultadoVisita: 'Resultado de la visita',
  cantidadCloro: 'Cantidad de cloro',
  caudal: 'Caudal',
  documentos: 'Documentos',
}

export type DatoEspecificoDetalle = {
  label: string
  value: string
}

export const listDatosEspecificosDetalle = (
  datos: Record<string, unknown> | null | undefined,
): DatoEspecificoDetalle[] => {
  if (!datos || typeof datos !== 'object') {
    return []
  }

  return Object.entries(datos)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => ({
      label: DATOS_ESPECIFICOS_LABELS[key] ?? key,
      value: Array.isArray(value) ? value.map(String).join(', ') : String(value),
    }))
}
