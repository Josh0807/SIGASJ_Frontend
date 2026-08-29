import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchWithAuth } from '../../../services/http/httpClient'
import { ESTADOS_PROYECTO, PROYECTO_ESTADO_UPDATE_PENDING } from '../types/estadoProyecto'
import { getAdminProyectos, toActivoQueryParam, toCreateProyectoPayload, toProyectosAdminParams, createAdminProyecto, toUpdateProyectoPayload, getAdminProyecto, updateAdminProyecto, uploadProyectoImagenPrincipal, removeProyectoImagenPrincipal, uploadProyectoImagenes, deleteProyectoImagen, reorderProyectoImagenes, updateProyectoVisibilidad, updateProyectoEstado } from './proyectosApi'

vi.mock('../../../services/http/httpClient', () => ({
  fetchWithAuth: vi.fn(),
}))

const listado = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
}

describe('toProyectosAdminParams', () => {
  it('omite filtros vacíos y conserva page y limit', () => {
    expect(
      toProyectosAdminParams({
        nombre: '  ',
        page: 2,
        limit: 10,
      }),
    ).toEqual({
      nombre: undefined,
      estado: undefined,
      activo: undefined,
      page: 2,
      limit: 10,
    })
  })

  it('envía los nombres reales del Backend', () => {
    expect(
      toProyectosAdminParams({
        nombre: '  acueducto  ',
        estado: 'EN_PROCESO',
        activo: false,
        page: 1,
        limit: 10,
      }),
    ).toEqual({
      nombre: 'acueducto',
      estado: 'EN_PROCESO',
      activo: false,
      page: 1,
      limit: 10,
    })
  })

  it('conserva activo=false y no lo trata como filtro ausente', () => {
    expect(toProyectosAdminParams({ activo: false }).activo).toBe(false)
    expect(toProyectosAdminParams({ activo: true }).activo).toBe(true)
    expect(toProyectosAdminParams({}).activo).toBeUndefined()
  })

  it('no envía un estado inventado', () => {
    expect(
      toProyectosAdminParams({
        estado: 'EN_EJECUCION' as 'PENDIENTE',
      }).estado,
    ).toBeUndefined()
  })
})

describe('toActivoQueryParam', () => {
  it('distingue false de la ausencia del filtro', () => {
    expect(toActivoQueryParam('false')).toBe(false)
    expect(toActivoQueryParam(false)).toBe(false)
    expect(toActivoQueryParam('true')).toBe(true)
    expect(toActivoQueryParam('')).toBeUndefined()
    expect(toActivoQueryParam(undefined)).toBeUndefined()
  })
})

describe('getAdminProyectos', () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset()
  })

  it('consulta GET /v1/admin/proyectos con los query params del Backend', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(listado)

    await getAdminProyectos({
      nombre: 'acueducto',
      estado: 'EN_PROCESO',
      activo: false,
      page: 2,
      limit: 10,
    })

    expect(fetchWithAuth).toHaveBeenCalledTimes(1)
    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/admin/proyectos', {
      params: {
        nombre: 'acueducto',
        estado: 'EN_PROCESO',
        activo: false,
        page: 2,
        limit: 10,
      },
    })
  })

  it('no reintenta el path alterno cuando el endpoint privado responde 401', async () => {
    vi.mocked(fetchWithAuth).mockRejectedValueOnce(
      new Error('HTTP 401: Unauthorized'),
    )

    await expect(getAdminProyectos()).rejects.toThrow('HTTP 401')
    expect(fetchWithAuth).toHaveBeenCalledTimes(1)
  })

  it('usa /admin/proyectos si el prefijo /v1 no existe', async () => {
    vi.mocked(fetchWithAuth)
      .mockRejectedValueOnce(new Error('HTTP 404: Not Found'))
      .mockResolvedValueOnce(listado)

    await expect(getAdminProyectos({ page: 1, limit: 10 })).resolves.toEqual(
      listado,
    )
    expect(fetchWithAuth).toHaveBeenNthCalledWith(2, '/admin/proyectos', {
      params: {
        nombre: undefined,
        estado: undefined,
        activo: undefined,
        page: 1,
        limit: 10,
      },
    })
  })
})

describe('toCreateProyectoPayload', () => {
  it('envía solo los campos permitidos del alta y omite descripción vacía', () => {
    expect(
      toCreateProyectoPayload({
        nombre: '  Ampliación de Acueducto  ',
        descripcion: '   ',
        encargadoRealizacion: '  Ing. María  ',
        duracion: '  8 meses  ',
        estado: 'EN_PROCESO',
      }),
    ).toEqual({
      nombre: 'Ampliación de Acueducto',
      encargadoRealizacion: 'Ing. María',
      duracion: '8 meses',
      estado: 'EN_PROCESO',
    })
  })

  it('incluye descripción cuando tiene texto y no envía campos internos', () => {
    const payload = toCreateProyectoPayload({
      nombre: 'Tanque',
      descripcion: 'Obra de almacenamiento',
      encargadoRealizacion: 'Ing. María',
      duracion: '12 meses',
      estado: 'PENDIENTE',
    })

    expect(payload).toEqual({
      nombre: 'Tanque',
      descripcion: 'Obra de almacenamiento',
      encargadoRealizacion: 'Ing. María',
      duracion: '12 meses',
      estado: 'PENDIENTE',
    })
    expect(payload).not.toHaveProperty('id')
    expect(payload).not.toHaveProperty('activo')
    expect(payload).not.toHaveProperty('imagenPrincipal')
    expect(payload).not.toHaveProperty('imagen')
    expect(payload).not.toHaveProperty('createdAt')
    expect(payload).not.toHaveProperty('updatedAt')
    expect(payload).not.toHaveProperty('fechaCreacion')
    expect(payload).not.toHaveProperty('usuarioCreador')
    expect(ESTADOS_PROYECTO).toContain(payload.estado)
  })

  it('no inventa un estado si el usuario no seleccionó uno válido', () => {
    expect(() =>
      toCreateProyectoPayload({
        nombre: 'Tanque',
        descripcion: '',
        encargadoRealizacion: 'Ing. María',
        duracion: '8 meses',
        estado: '',
      }),
    ).toThrow('Seleccione un estado válido.')
  })
})

describe('createAdminProyecto', () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset()
  })

  it('hace POST /v1/admin/proyectos con el payload del Backend', async () => {
    const created = {
      id: 12,
      nombre: 'Ampliación de Acueducto',
      descripcion: 'Red principal',
      encargadoRealizacion: 'Ing. María',
      duracion: '8 meses',
      estado: 'EN_PROCESO',
      imagenPrincipal: null,
      activo: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(created)

    await expect(
      createAdminProyecto({
        nombre: 'Ampliación de Acueducto',
        descripcion: 'Red principal',
        encargadoRealizacion: 'Ing. María',
        duracion: '8 meses',
        estado: 'EN_PROCESO',
      }),
    ).resolves.toEqual(created)

    expect(fetchWithAuth).toHaveBeenCalledTimes(1)
    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/admin/proyectos', {
      method: 'POST',
      body: JSON.stringify({
        nombre: 'Ampliación de Acueducto',
        descripcion: 'Red principal',
        encargadoRealizacion: 'Ing. María',
        duracion: '8 meses',
        estado: 'EN_PROCESO',
      }),
    })
  })
})

const detalle = {
  id: 12,
  nombre: 'Ampliación de Acueducto',
  descripcion: 'Red principal',
  encargadoRealizacion: 'Ing. María',
  duracion: '8 meses',
  estado: 'EN_PROCESO' as const,
  imagenPrincipal: null,
  activo: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  imagenes: [],
}

describe('toUpdateProyectoPayload', () => {
  it('envía solo los campos permitidos del PATCH y omite estado', () => {
    const payload = toUpdateProyectoPayload({
      nombre: '  Ampliación de Acueducto  ',
      descripcion: '  Red principal  ',
      encargadoRealizacion: '  Ing. María  ',
      duracion: '  8 meses  ',
      estado: 'COMPLETADO',
    })

    expect(payload).toEqual({
      nombre: 'Ampliación de Acueducto',
      descripcion: 'Red principal',
      encargadoRealizacion: 'Ing. María',
      duracion: '8 meses',
    })
    expect(payload).not.toHaveProperty('estado')
    expect(payload).not.toHaveProperty('id')
    expect(payload).not.toHaveProperty('activo')
    expect(payload).not.toHaveProperty('imagenPrincipal')
    expect(payload).not.toHaveProperty('imagenes')
  })

  it('omite descripción vacía y no inventa estado en el PATCH general', () => {
    const payload = toUpdateProyectoPayload({
      nombre: 'Tanque',
      descripcion: '   ',
      encargadoRealizacion: 'Ing. María',
      duracion: '12 meses',
      estado: 'PENDIENTE',
    })

    expect(payload).toEqual({
      nombre: 'Tanque',
      encargadoRealizacion: 'Ing. María',
      duracion: '12 meses',
    })
    expect(JSON.stringify(payload)).not.toContain('estado')
    expect(PROYECTO_ESTADO_UPDATE_PENDING).toBe(true)
  })
})

describe('getAdminProyecto', () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset()
  })

  it('consulta GET /v1/admin/proyectos/:id', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(detalle)

    await expect(getAdminProyecto(12)).resolves.toEqual(detalle)
    expect(fetchWithAuth).toHaveBeenCalledTimes(1)
    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/admin/proyectos/12')
  })
})

describe('updateAdminProyecto', () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset()
  })

  it('hace PATCH /v1/admin/proyectos/:id sin estado', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(detalle)

    await expect(
      updateAdminProyecto(12, {
        nombre: 'Ampliación de Acueducto',
        descripcion: 'Red principal',
        encargadoRealizacion: 'Ing. María',
        duracion: '8 meses',
        estado: 'COMPLETADO',
      }),
    ).resolves.toEqual(detalle)

    expect(fetchWithAuth).toHaveBeenCalledTimes(1)
    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/admin/proyectos/12', {
      method: 'PATCH',
      body: JSON.stringify({
        nombre: 'Ampliación de Acueducto',
        descripcion: 'Red principal',
        encargadoRealizacion: 'Ing. María',
        duracion: '8 meses',
      }),
    })

    const body = JSON.parse(
      String(vi.mocked(fetchWithAuth).mock.calls[0][1]?.body),
    ) as Record<string, unknown>
    expect(body).not.toHaveProperty('estado')
  })

  it('hace PATCH multipart FormData cuando se incluye imagenFile', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(detalle)
    const file = new File(['dummy'], 'cover.png', { type: 'image/png' })

    await updateAdminProyecto(
      12,
      {
        nombre: 'Ampliación de Acueducto',
        descripcion: 'Red principal',
        encargadoRealizacion: 'Ing. María',
        duracion: '8 meses',
        estado: 'EN_PROCESO',
      },
      file,
    )

    expect(fetchWithAuth).toHaveBeenCalledTimes(1)
    const call = vi.mocked(fetchWithAuth).mock.calls[0]
    expect(call[0]).toBe('/v1/admin/proyectos/12')
    expect(call[1]?.method).toBe('PATCH')
    expect(call[1]?.body).toBeInstanceOf(FormData)
    const form = call[1]?.body as FormData
    expect(form.get('nombre')).toBe('Ampliación de Acueducto')
    expect(form.get('imagenPrincipal')).toBe(file)
  })
})

describe('uploadProyectoImagenPrincipal / removeProyectoImagenPrincipal', () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset()
  })

  it('envía POST multipart a /v1/admin/proyectos/:id/imagen-principal', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(detalle)
    const file = new File(['content'], 'cover.jpg', { type: 'image/jpeg' })

    const res = await uploadProyectoImagenPrincipal(12, file)
    expect(res).toEqual(detalle)
    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/admin/proyectos/12/imagen-principal', {
      method: 'POST',
      body: expect.any(FormData),
    })
  })

  it('envía DELETE a /v1/admin/proyectos/:id/imagen-principal', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(detalle)

    const res = await removeProyectoImagenPrincipal(12)
    expect(res).toEqual(detalle)
    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/admin/proyectos/12/imagen-principal', {
      method: 'DELETE',
    })
  })
})

describe('uploadProyectoImagenes / deleteProyectoImagen / reorderProyectoImagenes', () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset()
  })

  it('envía POST multipart a /v1/admin/proyectos/:id/imagenes', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(detalle)
    const file1 = new File(['1'], 'photo1.jpg', { type: 'image/jpeg' })
    const file2 = new File(['2'], 'photo2.jpg', { type: 'image/jpeg' })

    const res = await uploadProyectoImagenes(12, [file1, file2])
    expect(res).toEqual(detalle)
    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/admin/proyectos/12/imagenes', {
      method: 'POST',
      body: expect.any(FormData),
    })
  })

  it('envía DELETE a /v1/admin/proyectos/:proyectoId/imagenes/:imagenId', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(detalle)

    const res = await deleteProyectoImagen(12, 5)
    expect(res).toEqual(detalle)
    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/admin/proyectos/12/imagenes/5', {
      method: 'DELETE',
    })
  })

  it('envía PATCH JSON a /v1/admin/proyectos/:proyectoId/imagenes/orden', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(detalle)
    const ordenes = [
      { id: 5, orden: 1 },
      { id: 6, orden: 2 },
    ]

    const res = await reorderProyectoImagenes(12, ordenes)
    expect(res).toEqual(detalle)
    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/admin/proyectos/12/imagenes/orden', {
      method: 'PATCH',
      body: JSON.stringify({ ordenes }),
    })
  })
})

describe('updateProyectoVisibilidad / updateProyectoEstado', () => {
  beforeEach(() => {
    vi.mocked(fetchWithAuth).mockReset()
  })

  it('envía PATCH con activo a /v1/admin/proyectos/:id/visibilidad', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(detalle)

    const res = await updateProyectoVisibilidad(12, true)
    expect(res).toEqual(detalle)
    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/admin/proyectos/12/visibilidad', {
      method: 'PATCH',
      body: JSON.stringify({ activo: true }),
    })
  })

  it('envía PATCH con estado a /v1/admin/proyectos/:id/estado', async () => {
    vi.mocked(fetchWithAuth).mockResolvedValueOnce(detalle)

    const res = await updateProyectoEstado(12, 'COMPLETADO')
    expect(res).toEqual(detalle)
    expect(fetchWithAuth).toHaveBeenCalledWith('/v1/admin/proyectos/12/estado', {
      method: 'PATCH',
      body: JSON.stringify({ estado: 'COMPLETADO' }),
    })
  })
})


