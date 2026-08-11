import { requestJson } from '../../../shared/api/http'

export type DevTokenResponse = {
  accessToken: string
  tokenType: string
  rol: string
  idUsuario: number
}

export async function issueDevToken(
  rol = 'Administradora',
): Promise<DevTokenResponse> {
  return requestJson<DevTokenResponse>('/api/auth/dev-token', {
    method: 'POST',
    body: { rol },
  })
}
