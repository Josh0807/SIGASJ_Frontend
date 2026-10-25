import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchWithAuth } from '../../../services/http/httpClient'
import {
  createFormularioDescargable,
  listFormulariosDescargablesAdmin,
  replaceFormularioDescargableArchivo,
  setFormularioDescargableEstado,
  toFormulariosDescargablesAdminError,
  updateFormularioDescargable,
} from './formulariosDescargablesApi'
import type { FormularioDescargableAdmin } from './types'

vi.mock('../../../services/http/httpClient', () => ({
  fetchWithAuth: vi.fn(),
}))

const sample: FormularioDescargableAdmin = {
  id: 1,
  nombre: 'Solicitud de nueva conexión',
  descripcion: 'Para conexión nueva',
  nombreArchivoOriginal: 'conexion.pdf',
  activo: true,
  fechaPublicacion: '2026-10-25T12:00:00.000Z',
  createdAt: '2026-10-20T08:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
}

beforeEach(() => {
  vi.mocked(fetchWithAuth).mockReset()
})

describe('formulariosDescargablesApi', () => {
  it('lista el catálogo administrativo', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce([sample])
    await expect(listFormulariosDescargablesAdmin()).resolves.toEqual([sample])
    expect(fetchWithAuth).toHaveBeenCalledWith('/admin/formularios-descargables')
  })

  it('crea con multipart campo archivo (sin paths internos)', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(sample)
    const file = new File(['%PDF-1.4'], 'conexion.pdf', {
      type: 'application/pdf',
    })

    await createFormularioDescargable({
      nombre: 'Solicitud de nueva conexión',
      descripcion: 'Para conexión nueva',
      activo: false,
      archivo: file,
    })

    expect(fetchWithAuth).toHaveBeenCalledTimes(1)
    const [path, options] = vi.mocked(fetchWithAuth).mock.calls[0]!
    expect(path).toBe('/admin/formularios-descargables')
    expect(options?.method).toBe('POST')
    const body = options?.body as FormData
    expect(body.get('nombre')).toBe('Solicitud de nueva conexión')
    expect(body.get('descripcion')).toBe('Para conexión nueva')
    expect(body.get('activo')).toBe('false')
    expect(body.get('archivo')).toBe(file)
    expect(body.has('fechaPublicacion')).toBe(false)
    expect(body.has('ubicacionArchivo')).toBe(false)
    expect(body.has('storageKey')).toBe(false)
    expect(body.has('usuarioId')).toBe(false)
    expect(body.has('id')).toBe(false)
    expect(body.has('createdAt')).toBe(false)
  })

  it('edita solo metadata JSON', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce({
      ...sample,
      nombre: 'Nombre B',
    })
    await updateFormularioDescargable(1, {
      nombre: 'Nombre B',
      descripcion: 'Nueva',
    })
    const [path, options] = vi.mocked(fetchWithAuth).mock.calls[0]!
    expect(path).toBe('/admin/formularios-descargables/1')
    expect(options?.method).toBe('PATCH')
    expect(JSON.parse(String(options?.body))).toEqual({
      nombre: 'Nombre B',
      descripcion: 'Nueva',
    })
  })

  it('reemplaza PDF con multipart archivo', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce({
      ...sample,
      nombreArchivoOriginal: 'nuevo.pdf',
    })
    const file = new File(['%PDF-1.4'], 'nuevo.pdf', {
      type: 'application/pdf',
    })
    await replaceFormularioDescargableArchivo(1, file)
    const [path, options] = vi.mocked(fetchWithAuth).mock.calls[0]!
    expect(path).toBe('/admin/formularios-descargables/1/archivo')
    expect(options?.method).toBe('PATCH')
    expect((options?.body as FormData).get('archivo')).toBe(file)
  })

  it('cambia estado activo', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce({
      ...sample,
      activo: false,
    })
    await setFormularioDescargableEstado(1, false)
    const [path, options] = vi.mocked(fetchWithAuth).mock.calls[0]!
    expect(path).toBe('/admin/formularios-descargables/1/estado')
    expect(options?.method).toBe('PATCH')
    expect(JSON.parse(String(options?.body))).toEqual({ activo: false })
  })

  it('mapea errores HTTP a mensajes amigables', () => {
    expect(
      toFormulariosDescargablesAdminError(new Error('HTTP 401: Unauthorized')),
    ).toContain('sesión')
    expect(
      toFormulariosDescargablesAdminError(new Error('HTTP 403: Forbidden')),
    ).toContain('permisos')
    expect(
      toFormulariosDescargablesAdminError(new Error('HTTP 404: Not Found')),
    ).toContain('ya no está disponible')
    expect(
      toFormulariosDescargablesAdminError(
        new Error('HTTP 400: Debe adjuntar un archivo PDF'),
      ),
    ).toContain('PDF')
    expect(
      toFormulariosDescargablesAdminError(new Error('HTTP 500: boom')),
    ).toContain('servidor')
  })
})
