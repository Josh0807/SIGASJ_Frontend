import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AveriasAdminDetailPage from './AveriasAdminDetailPage'
import AveriasAdminRoutes from './AveriasAdminRoutes'
import { AVERIAS_ADMIN_DETAIL_FIXTURE } from './fixtures/averiasAdminDetail.fixture'
import { findAveriaDetailFixture } from './fixtures/averiasAdminDetail.fixture'
import { AVERIAS_ADMIN_UI_FIXTURE } from './fixtures/averiasAdminList.fixture'
import * as averiasAdminApi from '../services/averiasAdminApi'
import { formatAveriaAdminDateTime } from './formatAveriaAdminDate'
import {
  AVERIA_NO_ABONADO_LABEL,
  AVERIA_NO_OBSERVATIONS_LABEL,
  AVERIA_NOT_PROVIDED_LABEL,
  AVERIA_UNASSIGNED_LABEL,
  AVERIA_UNAVAILABLE_LABEL,
  AVERIA_UNCLASSIFIED_LABEL,
  AVERIAS_ADMIN_DETAIL_ERROR,
  AVERIAS_ADMIN_DETAIL_LOADING_MESSAGE,
  AVERIAS_ADMIN_DETAIL_NOT_FOUND,
} from './types'

const adminDir = dirname(fileURLToPath(import.meta.url))
const styles = readFileSync(
  join(adminDir, '../../../index.css'),
  'utf8',
)

describe('AveriasAdminDetailPage', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.spyOn(averiasAdminApi, 'getAdminAverias').mockResolvedValue(
      AVERIAS_ADMIN_UI_FIXTURE,
    )
    vi.spyOn(averiasAdminApi, 'getAdminAveria').mockImplementation(async (id) => {
      const found = findAveriaDetailFixture(id)
      if (!found) {
        throw new Error('HTTP 404: No se encontró la avería solicitada.')
      }
      return found
    })
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  const renderAt = async (
    path: string,
    pageProps: Parameters<typeof AveriasAdminDetailPage>[0] = {},
  ) => {
    await act(async () => {
      root.render(
        <MemoryRouter key={path} initialEntries={[path]}>
          <Routes>
            <Route path="/admin/averias" element={<p>Listado de averías</p>} />
            <Route
              path="/admin/averias/:id"
              element={<AveriasAdminDetailPage {...pageProps} />}
            />
          </Routes>
        </MemoryRouter>,
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
  }

  const renderRoutes = async (path: string) => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/admin/averias/*" element={<AveriasAdminRoutes />} />
          </Routes>
        </MemoryRouter>,
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
  }

  it('muestra información general, reportante, ubicación y gestión de una avería asignada', async () => {
    await renderAt('/admin/averias/2')
    const assigned = AVERIAS_ADMIN_DETAIL_FIXTURE[1]
    expect(container.querySelector('h1')?.textContent).toBe('Detalle de avería')
    expect(container.textContent).toContain(assigned.codigoSeguimiento)
    expect(container.textContent).toContain(
      formatAveriaAdminDateTime(assigned.fechaReporte),
    )
    expect(container.textContent).toContain('Asignada')
    expect(container.textContent).toContain('Juan Pérez')
    expect(container.textContent).toContain('1-2345-6789')
    expect(container.textContent).toContain('8888-2222')
    expect(container.textContent).toContain('juan.perez@example.com')
    expect(container.textContent).toContain('Juan Pérez')
    expect(container.textContent).toContain('Barrio El Carmen')
    expect(container.textContent).toContain(assigned.ubicacion)
    expect(container.textContent).toContain(assigned.descripcion)
    expect(container.textContent).toContain('Luis Campos')
    expect(container.textContent).toContain('TUBERIA')
    expect(container.textContent).toContain('Alta')
    expect(container.textContent).toContain(
      formatAveriaAdminDateTime(assigned.fechaAsignacion),
    )
    expect(container.textContent).toContain(AVERIA_UNAVAILABLE_LABEL)
    expect(container.querySelector('.averias-admin__clamp')).toBeNull()
    expect(container.querySelector('input')).toBeNull()
    expect(container.querySelector('select')).toBeNull()
    expect(container.querySelector('textarea')).toBeNull()
  })

  it('muestra fallbacks de una avería recién recibida', async () => {
    await renderAt('/admin/averias/1')
    expect(container.textContent).toContain('AV-2026-0001')
    expect(container.textContent).toContain('Recibida')
    expect(container.textContent).toContain(AVERIA_NOT_PROVIDED_LABEL)
    expect(container.textContent).toContain(AVERIA_NO_ABONADO_LABEL)
    expect(container.textContent).toContain(AVERIA_UNASSIGNED_LABEL)
    expect(container.textContent).toContain(AVERIA_UNCLASSIFIED_LABEL)
    expect(container.textContent).toContain(AVERIA_UNAVAILABLE_LABEL)
    expect(container.textContent).toContain(AVERIA_NO_OBSERVATIONS_LABEL)
    expect(container.textContent).not.toContain('null')
    expect(container.textContent).not.toContain('undefined')
    expect(container.textContent).not.toContain('[object Object]')
  })

  it('muestra una avería en atención con fechas administrativas parciales', async () => {
    await renderAt('/admin/averias/4')
    const inProgress = AVERIAS_ADMIN_DETAIL_FIXTURE[3]
    expect(container.textContent).toContain('En atención')
    expect(container.textContent).toContain('Luis Campos')
    expect(container.textContent).toContain('TUBERIA')
    expect(container.textContent).toContain(
      formatAveriaAdminDateTime(inProgress.fechaAsignacion),
    )
    expect(container.textContent).toContain(
      formatAveriaAdminDateTime(inProgress.fechaInicioAtencion),
    )
    expect(container.textContent).toContain(AVERIA_UNAVAILABLE_LABEL)
    expect(container.textContent).not.toContain('Invalid Date')
  })

  it('muestra una avería resuelta con observaciones completas', async () => {
    await renderAt('/admin/averias/5')
    const resolved = AVERIAS_ADMIN_DETAIL_FIXTURE[4]
    expect(container.textContent).toContain('Resuelta')
    expect(container.textContent).toContain(
      formatAveriaAdminDateTime(resolved.fechaResolucion),
    )
    expect(container.textContent).toContain(resolved.observacionesAtencion)
    expect(container.textContent).not.toContain(AVERIA_NO_OBSERVATIONS_LABEL)
  })

  it('muestra Pendiente de atención y Fontanero solo con id', async () => {
    await renderAt('/admin/averias/3')
    expect(container.textContent).toContain('Pendiente de atención')
    expect(container.textContent).toContain('Fontanero #8')
    expect(container.textContent).toContain(AVERIA_UNCLASSIFIED_LABEL)
  })

  it('muestra textos largos completos sin truncar', async () => {
    await renderAt('/admin/averias/6')
    const longItem = AVERIAS_ADMIN_DETAIL_FIXTURE[5]
    expect(container.textContent).toContain(longItem.nombreReportante)
    expect(container.textContent).toContain(longItem.correoReportante)
    expect(container.textContent).toContain(longItem.ubicacion)
    expect(container.textContent).toContain(
      'El agua llega hasta el patio de tres viviendas',
    )
    expect(container.textContent).toContain(longItem.observacionesAtencion)
    expect(container.querySelector('.averias-admin__clamp')).toBeNull()
    expect(container.querySelector('.averias-admin__prewrap')).toBeTruthy()
  })

  it('muestra solo loading y no datos definitivos', async () => {
    await renderAt('/admin/averias/1', { loading: true })
    expect(container.textContent).toContain(AVERIAS_ADMIN_DETAIL_LOADING_MESSAGE)
    expect(container.textContent).not.toContain('AV-2026-0001')
    expect(container.textContent).not.toContain(AVERIA_UNASSIGNED_LABEL)
    expect(container.textContent).not.toContain(AVERIAS_ADMIN_DETAIL_ERROR)
    expect(container.textContent).not.toContain(AVERIAS_ADMIN_DETAIL_NOT_FOUND)
    expect(container.querySelector('.averias-admin__detail')).toBeNull()
  })

  it('muestra error controlado y oculta detalles técnicos', async () => {
    await renderAt('/admin/averias/1', {
      error: 'HTTP 500 QueryFailedError SQL Server TypeORM',
    })
    expect(container.textContent).toContain(AVERIAS_ADMIN_DETAIL_ERROR)
    expect(container.textContent).not.toContain('QueryFailedError')
    expect(container.textContent).not.toContain('SQL Server')
    expect(container.textContent).not.toContain('TypeORM')
    expect(container.textContent).not.toContain('HTTP 500')
    expect(container.textContent).not.toContain('AV-2026-0001')
    const back = [...container.querySelectorAll('a')].find(
      (anchor) => anchor.textContent === 'Volver al listado',
    )
    expect(back?.getAttribute('href')).toBe('/admin/averias')
  })

  it('muestra not found para un id inexistente', async () => {
    await renderAt('/admin/averias/99')
    expect(container.querySelector('h1')?.textContent).toBe(
      AVERIAS_ADMIN_DETAIL_NOT_FOUND,
    )
    expect(container.textContent).not.toContain('AV-2026-0001')
    expect(container.querySelector('.averias-admin__detail')).toBeNull()
    const back = [...container.querySelectorAll('a')].find(
      (anchor) => anchor.textContent === 'Volver al listado',
    )
    expect(back?.getAttribute('href')).toBe('/admin/averias')
  })

  it('trata un id inválido como recurso no encontrado', async () => {
    await renderAt('/admin/averias/abc')
    expect(container.textContent).toContain(AVERIAS_ADMIN_DETAIL_NOT_FOUND)
    expect(container.textContent).not.toContain('NaN')
    expect(container.textContent).not.toContain('undefined')
    expect(averiasAdminApi.getAdminAveria).not.toHaveBeenCalled()
  })

  it('vuelve al listado desde el detalle sin recargar', async () => {
    await renderAt('/admin/averias/1')
    const back = [...container.querySelectorAll('a')].find(
      (anchor) => anchor.textContent === 'Volver a averías',
    )
    expect(back?.getAttribute('href')).toBe('/admin/averias')
    await act(async () => {
      back?.click()
    })
    expect(container.textContent).toContain('Listado de averías')
    expect(container.textContent).not.toContain('Detalle de avería')
  })

  it('abre el detalle correcto desde Ver detalle del listado', async () => {
    await renderRoutes('/admin/averias')
    const detail = [...container.querySelectorAll('a')].find(
      (anchor) =>
        anchor.textContent === 'Ver detalle' &&
        anchor.getAttribute('href') === '/admin/averias/1',
    )
    expect(detail).toBeTruthy()
    await act(async () => {
      detail?.click()
    })
    expect(container.querySelector('h1')?.textContent).toBe('Detalle de avería')
    expect(container.textContent).toContain('AV-2026-0001')
    expect(container.textContent).toContain('María Rodríguez')
  })

  it('expone el enlace Volver con foco visible y sin inputs de edición', async () => {
    await renderAt('/admin/averias/2')
    const back = [...container.querySelectorAll('a')].find(
      (anchor) => anchor.textContent === 'Volver a averías',
    )
    expect(back?.getAttribute('href')).toBe('/admin/averias')
    expect(back?.tabIndex).toBeGreaterThanOrEqual(0)
    expect(back?.className).toContain('gallery-admin__link')
    expect(styles).toContain('.averias-admin .gallery-admin__link:focus-visible')
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(container.querySelectorAll('h2').length).toBeGreaterThanOrEqual(4)
  })

  it('no conserva el detalle anterior al cambiar de ID', async () => {
    await renderAt('/admin/averias/2')
    expect(container.textContent).toContain('AV-2026-0002')

    await renderAt('/admin/averias/1')
    expect(container.textContent).toContain('AV-2026-0001')
    expect(container.textContent).not.toContain('AV-2026-0002')
    expect(averiasAdminApi.getAdminAveria).toHaveBeenCalledWith(
      1,
      expect.any(AbortSignal),
    )
  })

  it('consulta GET /admin/averias/:id con el id numérico de la ruta', async () => {
    await renderAt('/admin/averias/25')
    expect(averiasAdminApi.getAdminAveria).toHaveBeenCalledWith(
      25,
      expect.any(AbortSignal),
    )
  })

  it('muestra error seguro cuando el detalle responde 500', async () => {
    vi.mocked(averiasAdminApi.getAdminAveria).mockRejectedValue(
      new Error('HTTP 500: QueryFailedError SQL Server TypeORM'),
    )
    await renderAt('/admin/averias/1')
    expect(container.textContent).toContain(AVERIAS_ADMIN_DETAIL_ERROR)
    expect(container.textContent).not.toContain('QueryFailedError')
    expect(container.textContent).not.toContain('SQL Server')
    expect(container.textContent).not.toContain('AV-2026-0001')
  })

  it('conserva search params al volver al listado', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/admin/averias/1',
              state: { listSearch: '?page=2&search=Juan&estado=RECIBIDA' },
            },
          ]}
        >
          <Routes>
            <Route path="/admin/averias" element={<p>Listado de averías</p>} />
            <Route
              path="/admin/averias/:id"
              element={<AveriasAdminDetailPage />}
            />
          </Routes>
        </MemoryRouter>,
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    const back = [...container.querySelectorAll('a')].find(
      (anchor) => anchor.textContent === 'Volver a averías',
    )
    expect(back?.getAttribute('href')).toBe(
      '/admin/averias?page=2&search=Juan&estado=RECIBIDA',
    )
  })

  it('agrupa secciones en desktop y colapsa el grid en tablet y móvil', () => {
    expect(styles).toContain('.averias-admin__detail-grid')
    expect(styles).toContain('repeat(2, minmax(0, 1fr))')
    expect(styles).toMatch(
      /@media \(max-width: 1199px\)[\s\S]*\.averias-admin__detail-grid/,
    )
    expect(styles).toContain('overflow-wrap: anywhere')
    expect(styles).toContain('white-space: pre-wrap')
  })
})
