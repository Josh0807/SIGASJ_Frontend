import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchWithAuth } from '../../../services/http/httpClient'
import { createTransparenciaPublication, updateTransparenciaEstado } from './transparenciaApi'

vi.mock('../../../services/http/httpClient', () => ({ fetchWithAuth: vi.fn() }))

const backendPublication = {
  id: 1,
  nombre: 'Informe',
  descripcionBreve: 'Informe anual',
  archivoUrl: '/uploads/informe.pdf',
  tipoArchivo: 'pdf' as const,
  ordenVisualizacion: 0,
  activa: true,
}

describe('transparenciaApi', () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset()
    vi.mocked(fetchWithAuth).mockResolvedValue(backendPublication)
  })

  it('crea la publicación con el contrato multipart esperado por el backend', async () => {
    const file = new File(['pdf'], 'informe.pdf', { type: 'application/pdf' })
    await createTransparenciaPublication(
      { nombre: 'Informe', descripcionBreve: 'Informe anual', ordenVisualizacion: 0, activo: true },
      file,
    )

    const [, options] = vi.mocked(fetchWithAuth).mock.calls[0]
    const form = options?.body as FormData
    expect(form).toBeInstanceOf(FormData)
    expect(form.get('activa')).toBe('true')
    expect(form.get('activo')).toBeNull()
    expect(form.get('archivo')).toBe(file)
  })

  it('actualiza el estado usando únicamente la propiedad activa', async () => {
    await updateTransparenciaEstado(1, false)
    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/admin/transparencia/1/estado', {
      method: 'PATCH',
      body: JSON.stringify({ activa: false }),
    })
  })
})
