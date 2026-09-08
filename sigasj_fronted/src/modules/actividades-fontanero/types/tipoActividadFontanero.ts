/** Códigos estables del catálogo; los IDs siempre los proporciona el backend. */
export type TipoActividadFontaneroCodigo =
  | 'CONTROL_FUGAS'
  | 'TOMA_PRESION'
  | 'VISITA_CAMPO'
  | 'CONTROL_CLOROS'
  | 'CONTROL_OPERATIVO'
  | 'INCAPACIDAD_VACACIONES'

export type TipoActividadFontaneroCatalogo = {
  id: number
  codigo: TipoActividadFontaneroCodigo
  nombre: string
  descripcion?: string
  orden: number
}

const CODIGOS_TIPO_ACTIVIDAD = new Set<string>([
  'CONTROL_FUGAS', 'TOMA_PRESION', 'VISITA_CAMPO', 'CONTROL_CLOROS',
  'CONTROL_OPERATIVO', 'INCAPACIDAD_VACACIONES',
])

export const isTipoActividadFontaneroCodigo = (
  value: string | undefined,
): value is TipoActividadFontaneroCodigo =>
  typeof value === 'string' && CODIGOS_TIPO_ACTIVIDAD.has(value)
