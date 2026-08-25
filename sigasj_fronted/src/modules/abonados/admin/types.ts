export type ServicioFormValues = {
  nis: string
  medidor: string
  sector: string
  tarifa: string
  numeroPlano: string
}

export type AbonadoRegistroFormValues = {
  origen: 'manual' | 'solicitud'
  idSolicitud: string
  nombre: string
  apellidos: string
  cedula: string
  telefono: string
  correo: string
  direccion: string
  servicio: ServicioFormValues
}

export const emptyServicioFormValues = (): ServicioFormValues => ({
  nis: '',
  medidor: '',
  sector: '',
  tarifa: '',
  numeroPlano: '',
})

export const emptyAbonadoRegistroFormValues = (): AbonadoRegistroFormValues => ({
  origen: 'manual',
  idSolicitud: '',
  nombre: '',
  apellidos: '',
  cedula: '',
  telefono: '',
  correo: '',
  direccion: '',
  servicio: emptyServicioFormValues(),
})
