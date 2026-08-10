import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  deleteAdminTransparenciaPublication,
  listAdminTransparenciaPublications,
  reorderAdminTransparenciaPublications,
  updateAdminTransparenciaEstado,
} from './adminTransparencia'

const token = 'test-token'

describe('adminTransparencia API', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('lista publicaciones activas e inactivas con filtros', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          JSON.stringify([
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
          ]),
      }),
    )

    const publications = await listAdminTransparenciaPublications(token, {
      nombre: 'informe',
      activo: false,
    })

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/transparencia?nombre=informe&activo=false',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
        }),
      }),
    )
    expect(publications).toHaveLength(2)
    expect(publications[1]?.activo).toBe(false)
    expect(publications[1]?.tipoArchivo).toBe('jpg')
  })

  it('actualiza el estado activo/inactivo de una publicación', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          JSON.stringify({
            idPublicacionTransparencia: 4,
            nombre: 'Informe',
            descripcionBreve: 'Resumen',
            archivoUrl: '/uploads/transparencia/informe.pdf',
            tipoArchivo: 'pdf',
            ordenVisualizacion: 0,
            activo: false,
          }),
      }),
    )

    const publication = await updateAdminTransparenciaEstado(token, 4, false)

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/transparencia/4/estado',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ activo: false }),
      }),
    )
    expect(publication.activo).toBe(false)
  })

  it('reorganiza publicaciones por posición', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          JSON.stringify([
            {
              idPublicacionTransparencia: 2,
              nombre: 'Segunda',
              descripcionBreve: 'B',
              archivoUrl: '/uploads/transparencia/2.pdf',
              tipoArchivo: 'pdf',
              ordenVisualizacion: 0,
              activo: true,
            },
          ]),
      }),
    )

    await reorderAdminTransparenciaPublications(token, [
      { idPublicacionTransparencia: 2, ordenVisualizacion: 0 },
    ])

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/transparencia/orden',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          publicaciones: [{ idPublicacionTransparencia: 2, ordenVisualizacion: 0 }],
        }),
      }),
    )
  })

  it('elimina una publicación', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        text: async () => '',
      }),
    )

    await deleteAdminTransparenciaPublication(token, 9)

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/transparencia/9',
      expect.objectContaining({
        method: 'DELETE',
      }),
    )
  })
})
