export type PublicAveriaFormValues = {
  nombreReportante: string
  identificacionReportante: string
  telefonoReportante: string
  correoReportante: string
  ubicacion: string
  sectorComunidad: string
  descripcion: string
  /** Coordenadas GPS opcionales capturadas en el dispositivo. */
  latitud: number | null
  longitud: number | null
}

export type PublicAveriaTextField = Exclude<
  keyof PublicAveriaFormValues,
  'latitud' | 'longitud'
>

export type PublicAveriaFormErrors = Partial<
  Record<PublicAveriaTextField, string>
>

export const EMPTY_PUBLIC_AVERIA_FORM: PublicAveriaFormValues = {
  nombreReportante: '',
  identificacionReportante: '',
  telefonoReportante: '',
  correoReportante: '',
  ubicacion: '',
  sectorComunidad: '',
  descripcion: '',
  latitud: null,
  longitud: null,
}

export const PUBLIC_AVERIA_FIELD_ORDER: PublicAveriaTextField[] = [
  'nombreReportante',
  'identificacionReportante',
  'telefonoReportante',
  'correoReportante',
  'ubicacion',
  'sectorComunidad',
  'descripcion',
]
