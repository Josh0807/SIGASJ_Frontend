import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchRawWithAuth, fetchWithAuth } from '../../../services/http/httpClient'
import {
  downloadFormularioOficial,
  getDownloadFilename,
  getFormulariosOficialesAdmin,
  getFormulariosOficialesPublicos,
  uploadFormularioOficial,
} from './formulariosOficialesApi'

vi.mock('../../../services/http/httpClient', () => ({
  fetchRawWithAuth: vi.fn(),
  fetchWithAuth: vi.fn(),
}))

const official = {
  tipoSolicitudId: 1,
  nombre: 'Solicitud de Arreglo de Pago Domiciliar',
  slug: 'arreglo-pago',
  tienePdf: true,
  nombreArchivo: 'arreglo.pdf',
  fechaActualizacion: '2026-10-20T12:00:00.000Z',
}

afterEach(() => {
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

describe('formularios oficiales API', () => {
  it('consulta el catálogo administrativo y carga el PDF en el campo multipart file', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce([official, { ...official, tipoSolicitudId: 99, slug: 'no-oficial' }]).mockResolvedValueOnce(official)
    const file = new File(['%PDF-documento'], 'arreglo.pdf', { type: 'application/pdf' })

    await expect(getFormulariosOficialesAdmin()).resolves.toEqual([official])
    await expect(uploadFormularioOficial(1, file)).resolves.toEqual(official)

    expect(fetchWithAuth).toHaveBeenNthCalledWith(1, '/solicitudes/admin/formularios-oficiales')
    const [path, options] = vi.mocked(fetchWithAuth).mock.calls[1]
    expect(path).toBe('/solicitudes/admin/formularios-oficiales/1')
    expect(options?.method).toBe('PUT')
    expect((options?.body as FormData).get('file')).toBe(file)
  })

  it('consulta el catálogo público y filtra slugs ajenos', async () => {
    const publicOfficial = { ...official, urlDescarga: '/solicitudes/arreglo-pago/formulario-oficial' }
    vi.mocked(fetchWithAuth).mockResolvedValue([publicOfficial, { ...official, tipoSolicitudId: 99, slug: 'no-oficial' }])

    await expect(getFormulariosOficialesPublicos()).resolves.toEqual([publicOfficial])
    expect(fetchWithAuth).toHaveBeenCalledWith('/solicitudes/formularios-oficiales')
  })

  it('obtiene el nombre desde Content-Disposition', () => {
    expect(getDownloadFilename('attachment; filename="formulario.pdf"', 'slug')).toBe('formulario.pdf')
    expect(getDownloadFilename("attachment; filename*=UTF-8''formulario%20oficial.pdf", 'slug')).toBe('formulario oficial.pdf')
    expect(getDownloadFilename(null, 'arreglo-pago')).toBe('arreglo-pago.pdf')
  })

  it('descarga únicamente respuestas PDF válidas', async () => {
    const headers = new Headers({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="oficial.pdf"',
    })
    vi.mocked(fetchRawWithAuth).mockResolvedValue({
      ok: true,
      status: 200,
      headers,
      blob: async () => new Blob(['%PDF-documento'], { type: 'application/pdf' }),
    } as Response)
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:official')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    vi.useFakeTimers()

    await expect(downloadFormularioOficial('arreglo-pago')).resolves.toBe('oficial.pdf')
    vi.runAllTimers()

    expect(fetchRawWithAuth).toHaveBeenCalledWith('/solicitudes/arreglo-pago/formulario-oficial', {
      headers: { Accept: 'application/pdf' },
    })
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:official')
    vi.useRealTimers()
  })

  it('no descarga HTML ni propaga un 404 como archivo', async () => {
    vi.mocked(fetchRawWithAuth).mockResolvedValueOnce(new Response('<html>Error</html>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    }))
    await expect(downloadFormularioOficial('arreglo-pago')).rejects.toThrow('no es un documento PDF')

    vi.mocked(fetchRawWithAuth).mockResolvedValueOnce(new Response(JSON.stringify({ message: 'PDF no publicado' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    }))
    await expect(downloadFormularioOficial('arreglo-pago')).rejects.toThrow('PDF no publicado')
  })

  it('usa la URL publicada solo si pertenece al mismo trámite', async () => {
    vi.mocked(fetchRawWithAuth)
      .mockResolvedValueOnce(new Response('%PDF-documento', {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' },
      }))
      .mockResolvedValueOnce(new Response('%PDF-documento', {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' },
      }))
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:official')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    await downloadFormularioOficial('arreglo-pago', '/solicitudes/tipos/arreglo-pago/formulario-oficial')
    await downloadFormularioOficial('arreglo-pago', '/solicitudes/cambio-titular/formulario-oficial')

    expect(fetchRawWithAuth).toHaveBeenNthCalledWith(1, '/solicitudes/tipos/arreglo-pago/formulario-oficial', {
      headers: { Accept: 'application/pdf' },
    })
    expect(fetchRawWithAuth).toHaveBeenNthCalledWith(2, '/solicitudes/arreglo-pago/formulario-oficial', {
      headers: { Accept: 'application/pdf' },
    })
  })
})
