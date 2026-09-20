/**
 * Clasificación administrativa (Backend `TipoAveria`, columna `tipoAveria`).
 * PATCH usa el campo `clasificacion` en el body.
 */
export const TIPOS_AVERIA = [
  'TUBO_MADRE',
  'TUBO_MEDIDOR',
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
  TUBO_MADRE: 'Tubo madre',
  TUBO_MEDIDOR: 'Tubo medidor',
  FUGA: 'Fuga de agua',
  TUBERIA_DANADA: 'Tubería dañada',
  MEDIDOR: 'Medidor',
  FALTA_DE_AGUA: 'Falta de agua',
  CONEXION: 'Conexión',
  INFRAESTRUCTURA: 'Infraestructura',
  OTRO: 'Otro',
}

const TIPO_AVERIA_DISPLAY_ALIASES: Record<string, string> = {
  TUBERIA: TIPO_AVERIA_LABELS.TUBO_MADRE,
}

/** El Fontanero califica solo estos tipos (diagrama). */
export const TIPOS_AVERIA_FONTANERO = ['TUBO_MADRE', 'TUBO_MEDIDOR'] as const

export const TIPO_AVERIA_FONTANERO_OPTIONS = TIPOS_AVERIA_FONTANERO.map(
  (value) => ({
    value,
    label: TIPO_AVERIA_LABELS[value],
  }),
)

export const TIPO_AVERIA_OPTIONS = TIPOS_AVERIA.map((value) => ({
  value,
  label: TIPO_AVERIA_LABELS[value],
}))

export const isTipoAveria = (value: string): value is TipoAveria =>
  TIPOS_AVERIA.includes(value as TipoAveria)

export const getTipoAveriaStoredLabel = (tipoAveria: string): string => {
  const key = tipoAveria.trim().toUpperCase()
  return TIPO_AVERIA_DISPLAY_ALIASES[key] ?? TIPO_AVERIA_LABELS[key as TipoAveria] ?? tipoAveria
}
