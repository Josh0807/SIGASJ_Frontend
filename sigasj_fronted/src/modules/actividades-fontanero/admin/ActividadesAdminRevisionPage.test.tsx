import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as actividadesApi from '../services/actividadesFontaneroApi'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { TIPOS_ACTIVIDAD_BACKEND } from '../test/tiposActividadFixture'
import ActividadesAdminRevisionPage from './ActividadesAdminRevisionPage'

const actividad = (
  overrides: Partial<ActividadFontaneroRegistrada> = {},
): ActividadFontaneroRegistrada => ({
  id: 12,
  titulo: 'Control de Fugas Barrio San Juan',
  descripcion: 'Reparación de tubería de 2 pulgadas',
  ubicacion: 'Calle Principal 100m Norte',
  observaciones: 'Material utilizado: 1 acople rápido',
  fontaneroId: 'fontanero-1',
  fontaneroNombre: 'Juan Pérez',
  tipoActividadId: 1,
  tipoActividadNombre: 'Control de Fugas',
  fechaActividad: '2026-08-23',
  estado: 'REPORTADA',
  observacionCorreccion: null,
  fechaRevision: null,
  revisadoPorId: null,
  datosEspecificos: { ubicacionFuga: 'Acera principal' },
  documentos: [{
    id: 5,
    actividadId: 12,
    nombreOriginal: 'evidencia-fuga.jpg',
    tipoArchivo: 'image/jpeg',
    rutaReferenciaArchivo: 'uploads/actividades-fontanero/12/evidencia.jpg',
    tamanio: 1024,
    fechaCarga: '2026-08-23T14:30:00.000Z',
  }],
  createdAt: '2026-08-23T14:30:00.000Z',
  updatedAt: '2026-08-23T14:30:00.000Z',
  ...overrides,
})

const flush = async () => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

const setInput = (input: HTMLInputElement, value: string) => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const setSelect = (select: HTMLSelectElement, value: string) => {
  select.value = value
  select.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('flujo frontend de revisión administrativa', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.spyOn(actividadesApi, 'getTiposActividadFontanero').mockResolvedValue({
      data: TIPOS_ACTIVIDAD_BACKEND,
      total: TIPOS_ACTIVIDAD_BACKEND.length,
    })
    vi.spyOn(actividadesApi, 'getReportesAdmin').mockResolvedValue({
      total: 2,
      porEstado: { REPORTADA: 1, REVISADA: 1 },
      porTipo: [],
      porFontanero: [
        { fontaneroId: 'fontanero-1', cantidad: 1 },
        { fontaneroId: 'fontanero-2', cantidad: 1 },
      ],
      actividades: [],
    })
    vi.spyOn(actividadesApi, 'getActividadesAdmin').mockResolvedValue({
      data: [actividad(), actividad({ id: 13, fontaneroId: 'fontanero-2', fontaneroNombre: 'Ana Mora', estado: 'REVISADA' })],
      total: 12,
      page: 1,
      limit: 10,
      totalPages: 2,
    })
    vi.spyOn(actividadesApi, 'getActividadAdminDetalle').mockResolvedValue(actividad())
    vi.spyOn(actividadesApi, 'revisarActividadAdmin').mockResolvedValue(
      actividad({
        estado: 'REVISADA',
        fechaRevision: '2026-09-08T20:45:00.000Z',
        revisadoPorId: 'admin-1',
      }),
    )
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    vi.restoreAllMocks()
  })

  const renderPage = async () => {
    await act(async () => {
      root.render(<MemoryRouter><ActividadesAdminRevisionPage /></MemoryRouter>)
    })
    await flush()
  }

  const button = (text: string) => Array.from(container.querySelectorAll('button'))
    .find((item) => item.textContent?.includes(text)) as HTMLButtonElement

  it('muestra fechas, fontaneros, tipos, estados y ninguna acción destructiva', async () => {
    await renderPage()
    expect(container.textContent).toContain('23 ago 2026')
    expect(container.textContent).toContain('Juan Pérez')
    expect(container.textContent).toContain('Control de Fugas')
    expect(container.textContent).toContain('Pendiente')
    expect(container.textContent).toContain('Revisada')
    expect(container.textContent).not.toMatch(/Eliminar|Editar|Aprobar|Rechazar/)
  })

  it('combina todos los filtros y los limpia', async () => {
    await renderPage()
    vi.mocked(actividadesApi.getActividadesAdmin).mockClear()
    const selects = container.querySelectorAll('select')
    const dates = container.querySelectorAll('input[type="date"]')
    await act(async () => {
      setSelect(selects[0] as HTMLSelectElement, 'fontanero-1')
      setSelect(selects[1] as HTMLSelectElement, String(TIPOS_ACTIVIDAD_BACKEND[0].id))
      setSelect(selects[2] as HTMLSelectElement, 'REPORTADA')
      setInput(dates[0] as HTMLInputElement, '2026-08-01')
      setInput(dates[1] as HTMLInputElement, '2026-08-31')
      button('Buscar').click()
    })
    await flush()
    expect(actividadesApi.getActividadesAdmin).toHaveBeenLastCalledWith({
      fontaneroId: 'fontanero-1',
      tipoActividadId: TIPOS_ACTIVIDAD_BACKEND[0].id,
      estado: 'REPORTADA',
      fechaInicio: '2026-08-01',
      fechaFin: '2026-08-31',
      page: 1,
      limit: 10,
    })
    await act(async () => button('Limpiar filtros').click())
    await flush()
    expect(Array.from(container.querySelectorAll('select')).every((item) => item.value === '')).toBe(true)
    expect(Array.from(container.querySelectorAll('input[type="date"]')).every((item) => (item as HTMLInputElement).value === '')).toBe(true)
  })

  it('pagina conservando los filtros aplicados', async () => {
    await renderPage()
    const estado = container.querySelectorAll('select')[2] as HTMLSelectElement
    await act(async () => { setSelect(estado, 'REPORTADA'); button('Buscar').click() })
    await flush()
    vi.mocked(actividadesApi.getActividadesAdmin).mockClear()
    await act(async () => button('Siguiente').click())
    await flush()
    expect(actividadesApi.getActividadesAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'REPORTADA', page: 2, limit: 10 }),
    )
  })

  it('consulta y muestra detalle, datos específicos y documentos', async () => {
    await renderPage()
    await act(async () => button('Ver detalle').click())
    await flush()
    expect(actividadesApi.getActividadAdminDetalle).toHaveBeenCalledWith(12)
    expect(container.textContent).toContain('Reparación de tubería de 2 pulgadas')
    expect(container.textContent).toContain('Acera principal')
    expect(container.textContent).toContain('evidencia-fuga.jpg')
    expect(container.querySelector('a[href="http://localhost:3000/uploads/actividades-fontanero/12/evidencia.jpg"]')).not.toBeNull()
  })

  it('muestra 404 de detalle sin presentar datos incompletos como definitivos', async () => {
    vi.mocked(actividadesApi.getActividadAdminDetalle).mockRejectedValue(new Error('HTTP 404: Actividad no encontrada'))
    await renderPage()
    await act(async () => button('Ver detalle').click())
    await flush()
    expect(container.textContent).toContain('La actividad solicitada no fue encontrada.')
    expect(button('Marcar como revisada')).toBeUndefined()
  })

  it('confirma la revisión, actualiza la vista y preserva los datos originales', async () => {
    await renderPage()
    await act(async () => button('Ver detalle').click())
    await flush()
    const original = actividad()
    await act(async () => button('Marcar como revisada').click())
    expect(container.textContent).toContain('¿Confirma que verificó la información')
    await act(async () => button('Sí, marcar como revisada').click())
    await flush()
    expect(actividadesApi.revisarActividadAdmin).toHaveBeenCalledTimes(1)
    expect(actividadesApi.revisarActividadAdmin).toHaveBeenCalledWith(12)
    expect(container.textContent).toContain('La actividad fue marcada como revisada.')
    expect(container.textContent).toContain('Actividad revisada')
    expect(container.textContent).toContain('admin-1')
    expect(container.textContent).toContain(original.titulo)
    expect(container.textContent).toContain(original.descripcion)
    expect(container.textContent).toContain('Acera principal')
  })

  it('evita doble procesamiento mientras el PATCH está pendiente', async () => {
    let resolveReview!: (value: ActividadFontaneroRegistrada) => void
    vi.mocked(actividadesApi.revisarActividadAdmin).mockImplementation(() => new Promise((resolve) => { resolveReview = resolve }))
    await renderPage()
    await act(async () => button('Ver detalle').click())
    await flush()
    await act(async () => button('Marcar como revisada').click())
    const confirm = button('Sí, marcar como revisada')
    await act(async () => { confirm.click(); confirm.click() })
    expect(actividadesApi.revisarActividadAdmin).toHaveBeenCalledTimes(1)
    await act(async () => resolveReview(actividad({ estado: 'REVISADA' })))
  })

  it('muestra carga y lista vacía', async () => {
    let resolveList!: (value: actividadesApi.ActividadFontaneroListado) => void
    vi.mocked(actividadesApi.getActividadesAdmin).mockImplementation(() => new Promise((resolve) => { resolveList = resolve }))
    await act(async () => root.render(<MemoryRouter><ActividadesAdminRevisionPage /></MemoryRouter>))
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull()
    await act(async () => resolveList({ data: [], total: 0, totalPages: 1 }))
    expect(container.textContent).toContain('No se encontraron actividades')
  })

  it('muestra el error de consulta sin confundirlo con una lista vacía', async () => {
    vi.mocked(actividadesApi.getActividadesAdmin).mockRejectedValue(new Error('HTTP 500: Error interno'))
    await renderPage()
    expect(container.textContent).toContain('Error interno')
    expect(container.textContent).not.toContain('No se encontraron actividades')
    expect(container.textContent).not.toContain('actividades encontradas')
    expect(button('Reintentar')).not.toBeNull()
  })
})
