import { describe, expect, it, vi } from 'vitest'
import { fetchWithAuth } from '../../../services/http/httpClient'
import { fetchPublicContacto, updateAdminContacto } from './contactService'

vi.mock('../../../services/http/httpClient', () => ({
  fetchWithAuth: vi.fn(),
}))

describe('contactService', () => {
  it('fetchPublicContacto consulta el endpoint público', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue({
      telefono: '8560-7584',
      telefonosAdicionales: [],
      email: 'asadasanjuan24@gmail.com',
      horarioAtencion: 'Lunes a sábado',
      horarioVentanilla: null,
      direccion: 'San Juan',
      referenciaUbicacion: null,
      regionResumen: 'Guanacaste',
      mapaUrl: null,
      mapaLatitud: null,
      mapaLongitud: null,
      mapaZoom: 18,
      textoUbicacionMapa: null,
      urlFacebook: null,
      descripcionContacto: null,
      actualizadoEn: '2026-01-01T00:00:00.000Z',
    })

    await expect(fetchPublicContacto()).resolves.toMatchObject({
      telefono: '8560-7584',
    })

    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/public/contacto')
  })

  it('updateAdminContacto envía PUT al endpoint admin', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue({
      telefono: '8888-8888',
      telefonosAdicionales: [],
      email: 'nuevo@sigasj.local',
      horarioAtencion: 'Lunes a viernes',
      horarioVentanilla: null,
      direccion: 'Nueva dirección',
      referenciaUbicacion: null,
      regionResumen: 'Guanacaste',
      mapaUrl: null,
      mapaLatitud: null,
      mapaLongitud: null,
      mapaZoom: 18,
      textoUbicacionMapa: null,
      urlFacebook: null,
      descripcionContacto: null,
      actualizadoEn: '2026-01-02T00:00:00.000Z',
    })

    await updateAdminContacto({
      telefono: '8888-8888',
      email: 'nuevo@sigasj.local',
      horarioAtencion: 'Lunes a viernes',
      direccion: 'Nueva dirección',
      regionResumen: 'Guanacaste',
    })

    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/admin/contacto', {
      method: 'PUT',
      body: JSON.stringify({
        telefono: '8888-8888',
        email: 'nuevo@sigasj.local',
        horarioAtencion: 'Lunes a viernes',
        direccion: 'Nueva dirección',
        regionResumen: 'Guanacaste',
      }),
    })
  })
})
