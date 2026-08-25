import { fetchWithAuth } from '../../../services/http/httpClient'
import type { AbonadoRegistroFormValues } from '../admin/types'

export type RegistroResumen = {
  idAbonado: number
  mensaje: string
  nombre: string
  apellidos: string
  cedula: string
  nis: string
  medidor: string
}

export type AbonadoDetail = {
  idAbonado: number
  nombre: string
  apellidos: string
  cedula: string
  telefono: string
  correo: string
  direccion: string
}

export type SolicitudPendiente = {
  idSolicitud: number
  nombre: string
  apellidos: string
  cedula: string
  telefono: string
  correo: string
  direccion: string
  utilizada: boolean
}

export type SolicitudesPendientesResponse = {
  solicitudes: SolicitudPendiente[]
  mensaje: string | null
}

export type RegistroAbonadoResponse = {
  idAbonado: number
  mensaje: string
}

const SOLICITUDES_PATHS = [
  '/v1/solicitudes/aprobadas-pendientes',
  '/solicitudes/aprobadas-pendientes',
]

const ABONADOS_PATHS = ['/v1/abonados', '/abonados']

async function fetchFirst<T>(paths: string[], init?: RequestInit): Promise<T> {
  let lastError: unknown

  for (const path of paths) {
    try {
      return await fetchWithAuth<T>(path, init)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('No fue posible completar la solicitud.')
}

export const getSolicitudesPendientes = () =>
  fetchFirst<SolicitudesPendientesResponse>(SOLICITUDES_PATHS)

export const getAbonadoById = (idAbonado: number) =>
  fetchFirst<AbonadoDetail>([`/v1/abonados/${idAbonado}`, `/abonados/${idAbonado}`])

export const registerAbonado = (values: AbonadoRegistroFormValues) => {
  const payload = {
    ...(values.origen === 'solicitud' && values.idSolicitud
      ? { idSolicitud: Number(values.idSolicitud) }
      : {}),
    nombre: values.nombre.trim(),
    apellidos: values.apellidos.trim(),
    cedula: values.cedula.trim(),
    telefono: values.telefono.trim(),
    correo: values.correo.trim(),
    direccion: values.direccion.trim(),
    servicio: {
      nis: values.servicio.nis.trim(),
      medidor: values.servicio.medidor.trim(),
      sector: values.servicio.sector.trim(),
      tarifa: values.servicio.tarifa.trim(),
      numeroPlano: values.servicio.numeroPlano.trim(),
    },
  }

  return fetchFirst<RegistroAbonadoResponse>(ABONADOS_PATHS, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
