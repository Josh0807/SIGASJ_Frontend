import { fetchWithAuth } from '../../../services/http/httpClient'

export type ConsultaCedulaResultado = {
  encontrada: boolean
  identificacion: string
  nombre: string | null
  tipoIdentificacion: string | null
}

export const consultarPersonaPorCedula = (identificacion: string) =>
  fetchWithAuth<ConsultaCedulaResultado>('/public/averias/cedula', {
    params: { identificacion },
  })
