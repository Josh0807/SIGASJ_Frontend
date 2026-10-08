import { fetchWithAuth } from '../../services/http/httpClient'
import type {
  Colaborador,
  ColaboradoresFiltros,
  ColaboradoresListado,
  ColaboradorPayload,
  CuentaUsuario,
} from './types'

export const COLABORADORES_ENDPOINT = '/rrhh/colaboradores'
export const COLABORADORES_PAGE_SIZE = 10

export const toColaboradoresParams = (filtros: ColaboradoresFiltros) => ({
  search: filtros.search.trim() || undefined,
  cargo: filtros.cargo.trim() || undefined,
  activo:
    filtros.estado === 'activos' ? true : filtros.estado === 'inactivos' ? false : undefined,
  page: filtros.page,
  limit: COLABORADORES_PAGE_SIZE,
})

export const getColaboradores = (filtros: ColaboradoresFiltros, signal?: AbortSignal) =>
  fetchWithAuth<ColaboradoresListado>(COLABORADORES_ENDPOINT, {
    params: toColaboradoresParams(filtros),
    signal,
  })

export const getColaborador = (id: number, signal?: AbortSignal) =>
  fetchWithAuth<Colaborador>(`${COLABORADORES_ENDPOINT}/${id}`, { signal })

export const registrarColaborador = (payload: ColaboradorPayload) =>
  fetchWithAuth<Colaborador>(COLABORADORES_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const actualizarColaborador = (id: number, payload: ColaboradorPayload) =>
  fetchWithAuth<Colaborador>(`${COLABORADORES_ENDPOINT}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

export const cambiarEstadoColaborador = (id: number, activo: boolean) =>
  fetchWithAuth<Colaborador>(`${COLABORADORES_ENDPOINT}/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ activo }),
  })

type UsuarioCrudo = {
  id?: number | string
  idUsuario?: number | string
  nombre?: string
  correo?: string
  email?: string
  rol?: string | { nombre?: string }
  activo?: boolean
}

/** Cuentas de SIGASJ que se pueden vincular a un colaborador. */
export const getCuentasUsuario = async (signal?: AbortSignal): Promise<CuentaUsuario[]> => {
  const respuesta = await fetchWithAuth<UsuarioCrudo[] | { data?: UsuarioCrudo[] }>(
    '/usuarios',
    { signal },
  )
  const filas = Array.isArray(respuesta) ? respuesta : (respuesta.data ?? [])
  return filas
    .map((fila) => ({
      id: Number(fila.id ?? fila.idUsuario),
      nombre: fila.nombre?.trim() ?? '',
      correo: (fila.correo ?? fila.email ?? '').trim(),
      rol: typeof fila.rol === 'string' ? fila.rol : (fila.rol?.nombre ?? ''),
      activo: fila.activo !== false,
    }))
    .filter((cuenta) => Number.isInteger(cuenta.id) && cuenta.id > 0)
}
