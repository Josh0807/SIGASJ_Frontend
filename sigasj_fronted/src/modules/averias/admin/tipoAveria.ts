/**
 * Clasificación administrativa (Backend `TipoAveria`, columna `tipoAveria`).
 * PATCH usa el campo `clasificacion` en el body.
 */
export const TIPOS_AVERIA = [
  'FUGA',
  'TUBERIA_DANADA',
  'MEDIDOR',
  'FALTA_DE_AGUA',
  'CONEXION',
  'INFRAESTRUCTURA',
  'OTRO',
] as const

export type TipoAveria = (typeof TIPOS_AVERIA)[number]

export const TIPO_AVERIA_LABELS: Record<TipoAveria, string> = {
  FUGA: 'Fuga de agua',
  TUBERIA_DANADA: 'Tubería dañada',
  MEDIDOR: 'Medidor',
  FALTA_DE_AGUA: 'Falta de agua',
  CONEXION: 'Conexión',
  INFRAESTRUCTURA: 'Infraestructura',
  OTRO: 'Otro',
}

export const TIPO_AVERIA_OPTIONS = TIPOS_AVERIA.map((value) => ({
  value,
  label: TIPO_AVERIA_LABELS[value],
}))

export const isTipoAveria = (value: string): value is TipoAveria =>
  TIPOS_AVERIA.includes(value as TipoAveria)
