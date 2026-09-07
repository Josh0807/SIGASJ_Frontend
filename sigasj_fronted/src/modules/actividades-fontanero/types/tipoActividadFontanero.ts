/** Códigos alineados con el catálogo del backend (TipoActividadFontanero). */
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
  descripcion: string
}

export const CATALOGO_TIPOS_ACTIVIDAD: TipoActividadFontaneroCatalogo[] = [
  {
    id: 1,
    codigo: 'CONTROL_FUGAS',
    nombre: 'Control de Fugas',
    descripcion: 'Registro de control de fugas en la red de distribución.',
  },
  {
    id: 2,
    codigo: 'TOMA_PRESION',
    nombre: 'Toma de presión',
    descripcion: 'Medición de presión en puntos operativos de la red.',
  },
  {
    id: 3,
    codigo: 'VISITA_CAMPO',
    nombre: 'Visita de Campo',
    descripcion: 'Visita operativa en campo para seguimiento o atención.',
  },
  {
    id: 4,
    codigo: 'CONTROL_CLOROS',
    nombre: 'Control de Cloros',
    descripcion: 'Control de niveles de cloro en el sistema de tratamiento.',
  },
  {
    id: 5,
    codigo: 'CONTROL_OPERATIVO',
    nombre: 'Control Operativo',
    descripcion: 'Registro de actividades operativas generales.',
  },
  {
    id: 6,
    codigo: 'INCAPACIDAD_VACACIONES',
    nombre: 'Incapacidad o vacaciones',
    descripcion: 'Registro de incapacidad o periodo de vacaciones del fontanero.',
  },
]

export const isTipoActividadFontaneroCodigo = (
  value: string | undefined,
): value is TipoActividadFontaneroCodigo =>
  CATALOGO_TIPOS_ACTIVIDAD.some((tipo) => tipo.codigo === value)

export const findTipoActividadByCodigo = (
  codigo: string | undefined,
): TipoActividadFontaneroCatalogo | undefined =>
  CATALOGO_TIPOS_ACTIVIDAD.find((tipo) => tipo.codigo === codigo)
