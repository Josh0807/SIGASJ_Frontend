export type Asociado = {
  id: number
  nombre: string
  apellidos: string
  cedula: string
  correoElectronico: string
  activo: boolean
  fechaRegistro: string
  fechaInactivacion: string | null
  createdAt: string
  updatedAt: string
}

export type RegistrarAsociadoPayload = Pick<
  Asociado,
  'nombre' | 'apellidos' | 'cedula' | 'correoElectronico'
> & { fechaRegistro?: string }

export type AsociadoFormValues = Record<
  'nombre' | 'apellidos' | 'cedula' | 'correoElectronico',
  string
>
