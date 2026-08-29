import { fetchWithAuth } from '../http/httpClient'

export type SistemaUsuario = {
  id: number | string
  nombre?: string
  email?: string
  rol?: string
  activo?: boolean
}

export async function getUsuariosSistema(): Promise<SistemaUsuario[]> {
  const paths = ['/v1/usuarios', '/usuarios']
  let lastError: Error | null = null

  for (const path of paths) {
    try {
      const data = await fetchWithAuth<SistemaUsuario[]>(path)
      return Array.isArray(data) ? data : []
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw lastError ?? new Error('No fue posible consultar la lista de usuarios del sistema.')
}
