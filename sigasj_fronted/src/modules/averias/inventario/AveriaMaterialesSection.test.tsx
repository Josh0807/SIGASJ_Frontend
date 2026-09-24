import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AveriaMaterialesSection, {
  AVERIA_MATERIALES_ADMIN_TITLE,
  AVERIA_MATERIALES_FONTANERO_TITLE,
  AVERIA_MATERIALES_SALIDA_LABEL,
  AVERIA_MATERIALES_SECRETARIA_SOLICITUDES,
  AVERIA_MATERIALES_SIN_EXISTENCIAS,
  AVERIA_MATERIALES_SIN_SALIDAS,
  AVERIA_MATERIALES_SIN_SOLICITUDES,
  AVERIA_MATERIALES_SOLICITAR_LABEL,
} from './AveriaMaterialesSection'
import * as materialesApi from '../../inventario/materialesApi'
import * as solicitudesApi from '../../inventario/solicitudes-materiales/solicitudesMaterialesApi'
import * as salidasApi from '../../inventario/salidas/salidasApi'

const tubo = {
  id: 1,
  nombre: 'Tubo PVC 1/2"',
  descripcion: null,
  unidadMedida: 'Metro',
  ubicacion: null,
  stockMinimo: 5,
  stockActual: 40,
  activo: true,
  idCategoria: 2,
  categoria: { id: 2, nombre: 'Tubería', descripcion: null, activo: true },
  idProveedor: null,
  proveedor: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

const codo = {
  ...tubo,
  id: 2,
  nombre: 'Codo PVC',
  unidadMedida: 'Unidad',
  stockActual: 0,
  categoria: { id: 2, nombre: 'Tubería', descripcion: null, activo: true },
}

const solicitud = {
  id: 88,
  codigo: 'SOL-2026-000088',
  fechaSolicitud: '2026-09-20T10:00:00.000Z',
  estado: 'PENDIENTE',
  idFontanero: 7,
  idAveria: 14,
  observacion: 'Materiales para fuga',
  cantidadMateriales: 1,
  detalles: [
    {
      id: 1,
      idSolicitud: 88,
      idMaterial: 1,
      cantidad: 5,
      observacion: 'Tramo principal',
      material: { id: 1, nombre: 'Tubo PVC 1/2"', unidadMedida: 'Metro', stockActual: 40 },
    },
  ],
}

const salida = {
  id: 45,
  tipo: 'SALIDA' as const,
  cantidad: 4,
  fechaMovimiento: '2026-09-21T09:00:00.000Z',
  idMaterial: 1,
  idUsuario: 7,
  idAveria: 14,
  idSolicitud: null,
  observacion: 'Despacho para avería',
  material: { id: 1, nombre: 'Tubo PVC 1/2"', unidadMedida: 'Metro' },
}

describe('AveriaMaterialesSection', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.spyOn(materialesApi, 'getMateriales').mockResolvedValue({
      data: [tubo, codo],
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    })
    vi.spyOn(solicitudesApi, 'getMisSolicitudesMateriales').mockResolvedValue([solicitud])
    vi.spyOn(solicitudesApi, 'getSolicitudesMaterialesAdmin').mockResolvedValue({
      data: [solicitud],
      total: 1,
      page: 1,
      limit: 100,
      totalPages: 1,
    })
    vi.spyOn(salidasApi, 'getSalidasPorAveria').mockResolvedValue([salida])
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  const renderSection = async (
    props: Partial<Parameters<typeof AveriaMaterialesSection>[0]> = {},
  ) => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <AveriaMaterialesSection
            averiaId={14}
            codigoSeguimiento="AV-2026-0014"
            variant="fontanero"
            {...props}
          />
        </MemoryRouter>,
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
  }

  it('muestra catálogo paginado, stock y la acción de solicitar con idAveria', async () => {
    await renderSection({ canRegistrarSalida: true })
    expect(container.textContent).toContain(AVERIA_MATERIALES_FONTANERO_TITLE)
    expect(container.textContent).toContain('Tubo PVC 1/2"')
    expect(container.textContent).toContain('Tubería')
    expect(container.textContent).toContain('40')
    expect(container.textContent).toContain('Disponible')
    expect(container.textContent).toContain(AVERIA_MATERIALES_SIN_EXISTENCIAS)
    expect(materialesApi.getMateriales).toHaveBeenCalledWith({
      activo: true,
      page: 1,
      limit: 10,
      nombre: undefined,
    })
    const solicitar = [...container.querySelectorAll('a')].find((anchor) =>
      anchor.textContent?.includes(AVERIA_MATERIALES_SOLICITAR_LABEL),
    )
    expect(solicitar).toBeTruthy()
    expect(solicitar?.getAttribute('href')).toContain('idAveria=14')
    expect(solicitar?.getAttribute('href')).toContain('from=%2Ffontanero%2Faverias%2F14')
    expect(solicitar?.getAttribute('href')).not.toContain('idFontanero')
    expect(container.textContent).toContain(AVERIA_MATERIALES_SALIDA_LABEL)
    const salidaLink = [...container.querySelectorAll('a')].find((anchor) =>
      anchor.textContent?.includes(AVERIA_MATERIALES_SALIDA_LABEL),
    )
    expect(salidaLink?.getAttribute('href')).toContain('idAveria=14')
    expect(salidaLink?.getAttribute('href')).toContain('/admin/inventario/salidas')
  })

  it('consulta solicitudes y salidas de la avería abierta', async () => {
    await renderSection()
    expect(solicitudesApi.getMisSolicitudesMateriales).toHaveBeenCalledWith({
      idAveria: 14,
    })
    expect(salidasApi.getSalidasPorAveria).toHaveBeenCalledWith(14)
    expect(container.textContent).toContain('SOL-2026-000088')
    expect(container.textContent).toContain('Pendiente')
    expect(container.textContent).toContain('Tubo PVC 1/2": 5 Metro')
    expect(container.textContent).toContain('Despacho para avería')
    expect(solicitudesApi.getMisSolicitudesMateriales).not.toHaveBeenCalledWith(
      expect.objectContaining({ idFontanero: expect.anything() }),
    )
  })

  it('no expone datos de salidas ante 403', async () => {
    vi.mocked(salidasApi.getSalidasPorAveria).mockRejectedValue(
      new Error('HTTP 403: No tiene autorización para consultar esta avería.'),
    )
    await renderSection()
    expect(container.textContent).toContain(
      'No tiene permiso para consultar las salidas de esta avería.',
    )
    expect(container.textContent).not.toContain('Despacho para avería')
  })

  it('muestra estados vacíos independientes', async () => {
    vi.mocked(solicitudesApi.getMisSolicitudesMateriales).mockResolvedValue([])
    vi.mocked(salidasApi.getSalidasPorAveria).mockResolvedValue([])
    await renderSection()
    expect(container.textContent).toContain(AVERIA_MATERIALES_SIN_SOLICITUDES)
    expect(container.textContent).toContain(AVERIA_MATERIALES_SIN_SALIDAS)
  })

  it('en administración muestra solicitudes por avería y oculta el catálogo', async () => {
    await renderSection({
      variant: 'admin',
      canRevisarSolicitudes: true,
      canRegistrarSalida: true,
    })
    expect(container.textContent).toContain(AVERIA_MATERIALES_ADMIN_TITLE)
    expect(container.textContent).not.toContain('Catálogo y existencias')
    expect(materialesApi.getMateriales).not.toHaveBeenCalled()
    expect(solicitudesApi.getSolicitudesMaterialesAdmin).toHaveBeenCalled()
    const adminCalls = vi.mocked(solicitudesApi.getSolicitudesMaterialesAdmin).mock.calls
    expect(adminCalls.every((call) => call[0]?.idAveria === 14)).toBe(true)
    expect(container.querySelector('a[href="/admin/inventario/solicitudes"]')).toBeTruthy()
    expect(container.querySelector('a[href="/admin/inventario/solicitudes/88"]')).toBeTruthy()
  })

  it('Secretaria no consulta ni revisa solicitudes', async () => {
    await renderSection({
      variant: 'admin',
      canRevisarSolicitudes: false,
      canRegistrarSalida: false,
    })
    expect(solicitudesApi.getSolicitudesMaterialesAdmin).not.toHaveBeenCalled()
    expect(container.textContent).toContain(AVERIA_MATERIALES_SECRETARIA_SOLICITUDES)
    expect(container.textContent).not.toContain(AVERIA_MATERIALES_SOLICITAR_LABEL)
    expect(container.textContent).not.toContain(AVERIA_MATERIALES_SALIDA_LABEL)
    expect(container.textContent).not.toContain('Revisar solicitudes')
  })
})
