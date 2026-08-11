import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../ApiError'
import { requestFormData, requestJson, requestVoid } from '../http'
import {
  createAdminTransparenciaPublication,
  deleteAdminTransparenciaPublication,
  listAdminTransparenciaPublications,
  reorderAdminTransparenciaPublications,
  replaceAdminTransparenciaFile,
  updateAdminTransparenciaEstado,
  updateAdminTransparenciaPublication,
} from './adminTransparencia'

vi.mock('../http', () => ({
  requestJson: vi.fn(),
  requestFormData: vi.fn(),
  requestVoid: vi.fn(),
}))

const requestJsonMock = vi.mocked(requestJson)
const requestFormDataMock = vi.mocked(requestFormData)
const requestVoidMock = vi.mocked(requestVoid)
const token = 'test-token'

describe('adminTransparencia API', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    requestJsonMock.mockReset()
    requestFormDataMock.mockReset()
    requestVoidMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('lista publicaciones activas e inactivas con filtros', async () => {
    requestJsonMock.mockResolvedValue([
      {
        idPublicacionTransparencia: 1,
        nombre: 'Informe',
        descripcionBreve: 'Resumen',
        archivoUrl: '/uploads/transparencia/informe.pdf',
        tipoArchivo: 'pdf',
        ordenVisualizacion: 0,
        activo: true,
      },
      {
        idPublicacionTransparencia: 2,
        nombre: 'Foto',
        descripcionBreve: 'Muestreo',
        archivoUrl: '/uploads/transparencia/foto.jpg',
        tipoArchivo: 'jpg',
        ordenVisualizacion: 1,
        activo: false,
      },
    ])

    const publications = await listAdminTransparenciaPublications(token, {
      nombre: 'informe',
      activo: false,
    })

    expect(requestJsonMock).toHaveBeenCalledWith(
      '/api/admin/transparencia?nombre=informe&activo=false',
      expect.objectContaining({ token }),
    )
    expect(publications).toHaveLength(2)
    expect(publications[1]?.activo).toBe(false)
    expect(publications[1]?.tipoArchivo).toBe('jpg')
  })

  it('actualiza el estado activo/inactivo de una publicación', async () => {
    requestJsonMock.mockResolvedValue({
      idPublicacionTransparencia: 4,
      nombre: 'Informe',
      descripcionBreve: 'Resumen',
      archivoUrl: '/uploads/transparencia/informe.pdf',
      tipoArchivo: 'pdf',
      ordenVisualizacion: 0,
      activo: false,
    })

    const publication = await updateAdminTransparenciaEstado(token, 4, false)

    expect(requestJsonMock).toHaveBeenCalledWith(
      '/api/admin/transparencia/4/estado',
      expect.objectContaining({
        method: 'PATCH',
        token,
        body: { activo: false },
      }),
    )
    expect(publication.activo).toBe(false)
  })

  it('reorganiza publicaciones por posición', async () => {
    requestJsonMock.mockResolvedValue([
      {
        idPublicacionTransparencia: 2,
        nombre: 'Segunda',
        descripcionBreve: 'B',
        archivoUrl: '/uploads/transparencia/2.pdf',
        tipoArchivo: 'pdf',
        ordenVisualizacion: 0,
        activo: true,
      },
    ])

    await reorderAdminTransparenciaPublications(token, [
      { idPublicacionTransparencia: 2, ordenVisualizacion: 0 },
    ])

    expect(requestJsonMock).toHaveBeenCalledWith(
      '/api/admin/transparencia/orden',
      expect.objectContaining({
        method: 'PATCH',
        token,
        body: {
          publicaciones: [{ idPublicacionTransparencia: 2, ordenVisualizacion: 0 }],
        },
      }),
    )
  })

  it('elimina una publicación', async () => {
    requestVoidMock.mockResolvedValue(undefined)

    await deleteAdminTransparenciaPublication(token, 9)

    expect(requestVoidMock).toHaveBeenCalledWith(
      '/api/admin/transparencia/9',
      expect.objectContaining({
        method: 'DELETE',
        token,
      }),
    )
  })

  it('registra una publicación con multipart/form-data y token', async () => {
    requestFormDataMock.mockResolvedValue({
      idPublicacionTransparencia: 5,
      nombre: 'Informe nuevo',
      descripcionBreve: 'Resumen',
      archivoUrl: '/uploads/transparencia/nuevo.pdf',
      tipoArchivo: 'pdf',
      ordenVisualizacion: 0,
      activo: true,
    })

    const formData = new FormData()
    formData.set('nombre', 'Informe nuevo')
    formData.set('descripcionBreve', 'Resumen')
    formData.set('archivo', new File(['pdf'], 'nuevo.pdf', { type: 'application/pdf' }))

    const publication = await createAdminTransparenciaPublication(token, formData)

    expect(requestFormDataMock).toHaveBeenCalledWith(
      '/api/admin/transparencia',
      formData,
      expect.objectContaining({
        method: 'POST',
        token,
      }),
    )
    expect(publication.nombre).toBe('Informe nuevo')
  })

  it('actualiza nombre y descripción con PUT autenticado', async () => {
    requestJsonMock.mockResolvedValue({
      idPublicacionTransparencia: 6,
      nombre: 'Informe editado',
      descripcionBreve: 'Nuevo resumen',
      archivoUrl: '/uploads/transparencia/informe.pdf',
      tipoArchivo: 'pdf',
      ordenVisualizacion: 1,
      activo: true,
    })

    const publication = await updateAdminTransparenciaPublication(token, 6, {
      nombre: 'Informe editado',
      descripcionBreve: 'Nuevo resumen',
    })

    expect(requestJsonMock).toHaveBeenCalledWith(
      '/api/admin/transparencia/6',
      expect.objectContaining({
        method: 'PUT',
        token,
        body: {
          nombre: 'Informe editado',
          descripcionBreve: 'Nuevo resumen',
        },
      }),
    )
    expect(publication.descripcionBreve).toBe('Nuevo resumen')
  })

  it('reemplaza el archivo con PATCH multipart', async () => {
    requestFormDataMock.mockResolvedValue({
      idPublicacionTransparencia: 7,
      nombre: 'Foto',
      descripcionBreve: 'Imagen',
      archivoUrl: '/uploads/transparencia/nueva.jpg',
      tipoArchivo: 'jpg',
      ordenVisualizacion: 0,
      activo: true,
    })

    const formData = new FormData()
    formData.set('archivo', new File(['img'], 'nueva.jpg', { type: 'image/jpeg' }))

    await replaceAdminTransparenciaFile(token, 7, formData)

    expect(requestFormDataMock).toHaveBeenCalledWith(
      '/api/admin/transparencia/7/archivo',
      formData,
      expect.objectContaining({
        method: 'PATCH',
        token,
      }),
    )
  })

  it('propaga error 403 cuando el usuario no tiene permisos', async () => {
    requestJsonMock.mockRejectedValue(
      new ApiError('Forbidden resource', 'HTTP', 403),
    )

    await expect(
      listAdminTransparenciaPublications(token),
    ).rejects.toMatchObject({
      message: 'Forbidden resource',
      code: 'HTTP',
      status: 403,
    } satisfies Partial<ApiError>)
  })

  it('propaga el mensaje de error del backend', async () => {
    requestFormDataMock.mockRejectedValue(
      new ApiError('Debe enviar un archivo.', 'HTTP', 400),
    )

    await expect(
      createAdminTransparenciaPublication(token, new FormData()),
    ).rejects.toMatchObject({
      message: 'Debe enviar un archivo.',
      code: 'HTTP',
      status: 400,
    } satisfies Partial<ApiError>)
  })
})
