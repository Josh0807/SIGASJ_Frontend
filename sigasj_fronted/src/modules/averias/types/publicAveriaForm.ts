export type PublicAveriaFormValues = {
  nombreReportante: string
  identificacionReportante: string
  telefonoReportante: string
  correoReportante: string
  ubicacion: string
  sectorComunidad: string
  descripcion: string
}

export type PublicAveriaFormErrors = Partial<
  Record<keyof PublicAveriaFormValues, string>
>

export const EMPTY_PUBLIC_AVERIA_FORM: PublicAveriaFormValues = {
  nombreReportante: '',
  identificacionReportante: '',
  telefonoReportante: '',
  correoReportante: '',
  ubicacion: '',
  sectorComunidad: '',
  descripcion: '',
}

export const PUBLIC_AVERIA_FIELD_ORDER: (keyof PublicAveriaFormValues)[] = [
  'nombreReportante',
  'identificacionReportante',
  'telefonoReportante',
  'correoReportante',
  'ubicacion',
  'sectorComunidad',
  'descripcion',
]
