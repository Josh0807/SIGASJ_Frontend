import { fetchWithAuth } from '../../../services/http/httpClient'
import { fetchPublicApi } from '../../../services/http/publicApi'

export type InformacionInstitucional = {
  id?: number | string
  mision?: string
  vision?: string
  resanaHistorica?: string
  valores?: string[]
}

const PUBLIC_PATHS = ['/v1/public/informacion', '/public/informacion']
const ADMIN_PATHS = ['/v1/admin/informacion', '/admin/informacion']

export async function getPublicInformacion(): Promise<InformacionInstitucional> {
  return await fetchPublicApi<InformacionInstitucional>(PUBLIC_PATHS)
}

export async function getAdminInformacion(): Promise<InformacionInstitucional> {
  try {
    return await fetchWithAuth<InformacionInstitucional>(ADMIN_PATHS[0])
  } catch {
    return await fetchPublicApi<InformacionInstitucional>(PUBLIC_PATHS)
  }
}
