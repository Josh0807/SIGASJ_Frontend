import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchRawWithAuth, fetchWithAuth } from '../../../services/http/httpClient'
import {
  downloadFormularioDescargablePublico,
  getDownloadFilenamePublico,
  listFormulariosDescargablesPublicos,
} from './formulariosDescargablesPublicApi'

vi.mock('../../../services/http/httpClient', () => ({
  fetchRawWithAuth: vi.fn(),
  fetchWithAuth: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(fetchWithAuth).mockReset()
  vi.mocked(fetchRawWithAuth).mockReset()
})

describe('formulariosDescargablesPublicApi', () => {
  it('lista solo activos y no usa rutas admin', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce([
      {
        id: 1,
        nombre: 'A',
        descripcion: 'Desc A',
        nombreArchivoOriginal: 'a.pdf',
        activo: true,
      },
      {
        id: 2,
        nombre: 'B',
        descripcion: 'Desc B',
        nombreArchivoOriginal: 'b.pdf',
        activo: false,
      },
    ])

    await expect(listFormulariosDescargablesPublicos()).resolves.toEqual([
      {
        id: 1,
        nombre: 'A',
        descripcion: 'Desc A',
        nombreArchivoOriginal: 'a.pdf',
        activo: true,
      },
    ])
    expect(fetchWithAuth).toHaveBeenCalledWith('/public/formularios-descargables')
  })

  it('obtiene filename desde Content-Disposition', () => {
    expect(
      getDownloadFilenamePublico('attachment; filename="oficial.pdf"', 'x.pdf'),
    ).toBe('oficial.pdf')
    expect(
      getDownloadFilenamePublico(
        "attachment; filename*=UTF-8''formulario%20extra.pdf",
        'x.pdf',
      ),
    ).toBe('formulario extra.pdf')
  })

  it('descarga Blob PDF y no llama endpoints de solicitudes', async () => {
    const headers = new Headers({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="conexion.pdf"',
    })
    vi.mocked(fetchRawWithAuth).mockResolvedValue({
      ok: true,
      status: 200,
      headers,
      blob: async () => new Blob(['%PDF-documento'], { type: 'application/pdf' }),
    } as Response)

    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:public')
    const revokeObjectURL = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined)
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)
    vi.useFakeTimers()

    await expect(
      downloadFormularioDescargablePublico(7, 'conexion.pdf'),
    ).resolves.toBe('conexion.pdf')
    vi.runAllTimers()

    expect(fetchRawWithAuth).toHaveBeenCalledWith(
      '/public/formularios-descargables/7/descarga',
      { headers: { Accept: 'application/pdf' } },
    )
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:public')
    vi.useRealTimers()
  })
})
