import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/routePaths'
import { clearAccessToken, setAuthSession } from '../../auth/utils/authStorage'
import { InternalAdminRoleName } from '../../auth/utils/internalRoles'
import * as salidasApi from '../../inventario/salidas/salidasApi'
import * as solicitudesMaterialesApi from '../../inventario/solicitudes-materiales/solicitudesMaterialesApi'
import * as averiasAdminApi from '../services/averiasAdminApi'
import AveriasAdminDetailPage from './AveriasAdminDetailPage'
import AveriasAdminEventosHistorial from './AveriasAdminEventosHistorial'
import { formatFechaHoraEvento } from './averiasEventoHistorial'
import { findAveriaDetailFixture } from './fixtures/averiasAdminDetail.fixture'
import {
  AVERIAS_EVENTOS_EMPTY_MESSAGE,
  AVERIAS_EVENTOS_LOAD_ERROR,
  AVERIAS_EVENTOS_LOADING_MESSAGE,
  type AveriaEventoHistorial,
} from './types'

const adminDir = dirname(fileURLToPath(import.meta.url))
const styles = readFileSync(join(adminDir, '../../../index.css'), 'utf8')

const eventos: AveriaEventoHistorial[] = [
  {
    id: 1,
    tipoEvento: 'REGISTRO',
    descripcion: 'Avería registrada',
    fechaHora: '2026-08-22T14:10:00.000Z',
    usuario: null,
    estadoAnterior: null,
    estadoNuevo: 'RECIBIDA',
    referencia: null,
  },
  {
    id: 2,
    tipoEvento: 'ASIGNACION_FONTANERO',
    descripcion: 'Avería asignada al Fontanero Juan Pérez',
    fechaHora: '2026-08-22T14:25:00.000Z',
    usuario: { id: 18, nombre: 'Administradora' },
    estadoAnterior: 'RECIBIDA',
    estadoNuevo: 'ASIGNADA',
    referencia: null,
  },
  {
    id: 3,
    tipoEvento: 'CAMBIO_ESTADO',
    descripcion: 'Cambio a Pendiente de atención',
    fechaHora: '2026-08-22T14:26:00.000Z',
    usuario: null,
    estadoAnterior: 'ASIGNADA',
    estadoNuevo: 'PENDIENTE',
    referencia: null,
  },
  {
    id: 4,
    tipoEvento: 'INICIO_ATENCION',
    descripcion: 'Inicio de atención',
    fechaHora: '2026-08-23T13:15:00.000Z',
    usuario: { id: 9, nombre: 'Juan Pérez' },
    estadoAnterior: 'PENDIENTE',
    estadoNuevo: 'EN_ATENCION',
    referencia: null,
  },
  {
    id: 5,
    tipoEvento: 'CAMBIO_PRIORIDAD',
    descripcion: 'Prioridad modificada de Media a Alta',
    fechaHora: '2026-08-23T13:20:00.000Z',
    usuario: { id: 9, nombre: 'Juan Pérez' },
    estadoAnterior: null,
    estadoNuevo: null,
    referencia: null,
  },
  {
    id: 6,
    tipoEvento: 'CLASIFICACION_TIPO',
    descripcion: 'Tipo de avería clasificado como Tubo madre',
    fechaHora: '2026-08-23T13:25:00.000Z',
    usuario: { id: 9, nombre: 'Juan Pérez' },
    estadoAnterior: null,
    estadoNuevo: null,
    referencia: null,
  },
  {
    id: 7,
    tipoEvento: 'OBSERVACION',
    descripcion: 'Observación registrada: fuga visible en la acera',
    fechaHora: '2026-08-23T13:28:00.000Z',
    usuario: { id: 9, nombre: 'Juan Pérez' },
    estadoAnterior: null,
    estadoNuevo: null,
    referencia: { tipo: 'ObservacionAveria', id: 4 },
  },
  {
    id: 8,
    tipoEvento: 'SOLICITUD_MATERIAL',
    descripcion: 'Solicitud de materiales SM-12 registrada para la atención',
    fechaHora: '2026-08-23T13:30:00.000Z',
    usuario: { id: 9, nombre: 'Juan Pérez' },
    estadoAnterior: null,
    estadoNuevo: null,
    referencia: { tipo: 'SolicitudMaterial', id: 12 },
  },
  {
    id: 9,
    tipoEvento: 'SALIDA_MATERIAL',
    descripcion: 'Salida de material registrada: Tubo PVC, cantidad 2',
    fechaHora: '2026-08-23T13:40:00.000Z',
    usuario: { id: 9, nombre: 'Juan Pérez' },
    estadoAnterior: null,
    estadoNuevo: null,
    referencia: { tipo: 'MovimientoInventario', id: 15 },
  },
  {
    id: 10,
    tipoEvento: 'NOTIFICACION',
    descripcion: 'Notificación interna registrada: Avería resuelta. Resultado: registrada.',
    fechaHora: '2026-08-23T15:30:00.000Z',
    usuario: null,
    estadoAnterior: null,
    estadoNuevo: null,
    referencia: { tipo: 'NotificacionAveria', id: 3 },
  },
  {
    id: 11,
    tipoEvento: 'RESOLUCION',
    descripcion: 'Avería resuelta',
    fechaHora: '2026-08-23T15:31:00.000Z',
    usuario: { id: 9, nombre: 'Juan Pérez' },
    estadoAnterior: 'EN_ATENCION',
    estadoNuevo: 'RESUELTA',
    referencia: null,
  },
]

describe('Historial de la avería', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    clearAccessToken()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    clearAccessToken()
    vi.restoreAllMocks()
  })

  const renderSection = async () => {
    await act(async () => {
      root.render(<AveriasAdminEventosHistorial averiaId={1} />)
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
  }

  it('muestra los eventos en el orden del endpoint, con fecha, hora y tipo', async () => {
    vi.spyOn(averiasAdminApi, 'getAdminAveriaEventosHistorial').mockResolvedValue({
      id: 1,
      codigoSeguimiento: 'AV-2026-0001',
      data: eventos,
    })

    await renderSection()

    expect(container.textContent).toContain('Historial de la avería')
    const items = [...container.querySelectorAll('.averias-evento__item')]
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining('Avería registrada'),
      expect.stringContaining('Avería asignada al Fontanero Juan Pérez'),
      expect.stringContaining('Cambio a Pendiente de atención'),
      expect.stringContaining('Inicio de atención'),
      expect.stringContaining('Prioridad modificada de Media a Alta'),
      expect.stringContaining('Tipo de avería clasificado como Tubo madre'),
      expect.stringContaining('Observación registrada: fuga visible en la acera'),
      expect.stringContaining('Solicitud de materiales SM-12 registrada para la atención'),
      expect.stringContaining('Salida de material registrada: Tubo PVC, cantidad 2'),
      expect.stringContaining('Notificación interna registrada: Avería resuelta'),
      expect.stringContaining('Avería resuelta'),
    ])

    expect(items[0]?.textContent).toContain(
      formatFechaHoraEvento('2026-08-22T14:10:00.000Z'),
    )
    expect(items[0]?.textContent).toContain('Registro')
    expect(items[0]?.textContent).toContain('Estado: Recibida')
    expect(items[0]?.textContent).not.toContain('Realizado por')

    expect(items[1]?.textContent).toContain('Asignación')
    expect(items[1]?.textContent).toContain('Realizado por: Administradora')
    expect(items[1]?.textContent).toContain('Estado: Recibida → Asignada')

    expect(items[2]?.textContent).toContain('Cambio de estado')
    expect(items[2]?.textContent).toContain('Estado: Asignada → Pendiente de atención')
    expect(items[3]?.textContent).toContain('Inicio de atención')
    expect(items[3]?.textContent).toContain('Estado: Pendiente de atención → En atención')
    expect(items[4]?.textContent).toContain('Prioridad')
    expect(items[5]?.textContent).toContain('Clasificación')
    expect(items[6]?.textContent).toContain('Observación')
    expect(items[6]?.textContent).toContain('Observación registrada')
    expect(items[7]?.textContent).toContain('Solicitud de materiales')
    expect(items[8]?.textContent).toContain('Salida de material')
    expect(items[9]?.textContent).toContain('Notificación')
    expect(items[9]?.textContent).toContain('Notificación interna')
    expect(items[10]?.textContent).toContain('Resolución')
    expect(items[10]?.textContent).toContain('Estado: En atención → Resuelta')
    expect(items[10]?.textContent).toContain('Realizado por: Juan Pérez')

    expect(container.querySelector('button')).toBeNull()
    expect(container.textContent).not.toContain('Editar')
    expect(container.textContent).not.toContain('Eliminar')
    expect(container.textContent).not.toContain('8888')
  })

  it('informa cuando no hay eventos', async () => {
    vi.spyOn(averiasAdminApi, 'getAdminAveriaEventosHistorial').mockResolvedValue({
      id: 1,
      codigoSeguimiento: 'AV-2026-0001',
      data: [],
    })

    await renderSection()

    expect(container.textContent).toContain(AVERIAS_EVENTOS_EMPTY_MESSAGE)
    expect(container.querySelector('.averias-evento__lista')).toBeNull()
  })

  it('muestra carga y luego el historial', async () => {
    let resolveTimeline: (value: {
      id: number
      codigoSeguimiento: string
      data: AveriaEventoHistorial[]
    }) => void = () => undefined
    vi.spyOn(averiasAdminApi, 'getAdminAveriaEventosHistorial').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveTimeline = resolve
        }),
    )

    await act(async () => {
      root.render(<AveriasAdminEventosHistorial averiaId={1} />)
    })

    expect(container.textContent).toContain(AVERIAS_EVENTOS_LOADING_MESSAGE)
    expect(container.querySelector('.averias-evento')?.getAttribute('aria-busy')).toBe(
      'true',
    )

    await act(async () => {
      resolveTimeline({
        id: 1,
        codigoSeguimiento: 'AV-2026-0001',
        data: [eventos[0]!],
      })
      await Promise.resolve()
    })

    expect(container.textContent).toContain('Avería registrada')
    expect(container.textContent).not.toContain(AVERIAS_EVENTOS_LOADING_MESSAGE)
  })

  it('permite reintentar cuando falla la consulta', async () => {
    const spy = vi
      .spyOn(averiasAdminApi, 'getAdminAveriaEventosHistorial')
      .mockRejectedValueOnce(new Error('HTTP 500: fallo'))
      .mockResolvedValueOnce({
        id: 1,
        codigoSeguimiento: 'AV-2026-0001',
        data: [eventos[10]!],
      })

    await renderSection()

    expect(container.textContent).toContain(AVERIAS_EVENTOS_LOAD_ERROR)
    const retry = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Reintentar',
    )
    expect(retry).toBeTruthy()

    await act(async () => {
      retry?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(spy).toHaveBeenCalledTimes(2)
    expect(container.textContent).toContain('Avería resuelta')
    expect(container.textContent).not.toContain(AVERIAS_EVENTOS_LOAD_ERROR)
  })

  it('adapta la línea de tiempo en tableta y celular', () => {
    expect(styles).toContain('.averias-evento__lista')
    expect(styles).toContain('.averias-evento__tipo')
    expect(styles).toContain('@media (max-width: 1199px)')
    expect(styles).toContain('@media (max-width: 760px)')
    expect(styles).toContain('.averias-admin__section.averias-evento')
    expect(styles).toContain('.averias-evento .gallery-admin__empty button:focus-visible')
  })
})

describe('detalle administrativo con historial', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    clearAccessToken()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.spyOn(averiasAdminApi, 'getAdminAveria').mockImplementation(async (id) => {
      const found = findAveriaDetailFixture(id)
      if (!found) {
        throw new Error('HTTP 404: No se encontró la avería solicitada.')
      }
      return found
    })
    vi.spyOn(
      solicitudesMaterialesApi,
      'getSolicitudesMaterialesAdmin',
    ).mockResolvedValue({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 })
    vi.spyOn(salidasApi, 'getSalidasPorAveria').mockResolvedValue([])
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    clearAccessToken()
    vi.restoreAllMocks()
  })

  const login = () => {
    setAuthSession({
      accessToken: 'token-admin',
      user: {
        id: '18',
        role: InternalAdminRoleName.Administradora,
        email: 'admin@asadasanjuan.cr',
        name: 'Administradora',
      },
    })
  }

  it('incluye la sección en el detalle y redirige si el historial no está autorizado', async () => {
    login()
    vi.spyOn(averiasAdminApi, 'getAdminAveriaEventosHistorial').mockRejectedValue(
      new Error('HTTP 403: Forbidden'),
    )

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/averias/1']}>
          <Routes>
            <Route path="/admin/averias/:id" element={<AveriasAdminDetailPage />} />
            <Route path={UNAUTHORIZED_ROUTE_PATH} element={<p>Sin acceso</p>} />
          </Routes>
        </MemoryRouter>,
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(container.textContent).toContain('Sin acceso')
  })
})
