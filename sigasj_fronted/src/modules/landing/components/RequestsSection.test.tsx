import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as officialFormsApi from '../../solicitudes-publicas/formularios-oficiales/formulariosOficialesApi'
import { FORMULARIOS_OFICIALES_SLUGS } from '../../solicitudes-publicas/formularios-oficiales/types'
import {
  ONLINE_SERVICE_REQUEST_PATHS,
  SERVICE_REQUEST_ROUTES,
} from '../config/serviceRequestRoutes'
import RequestsSection from './RequestsSection'

vi.mock('../../solicitudes-publicas/formularios-oficiales/formulariosOficialesApi', () => ({
  getFormulariosOficialesPublicos: vi.fn(),
  downloadFormularioOficial: vi.fn(),
}))

let clientRoot: Root | null = null
let clientContainer: HTMLDivElement | null = null

afterEach(() => {
  if (clientRoot) act(() => clientRoot?.unmount())
  clientRoot = null
  clientContainer?.remove()
  clientContainer = null
  vi.clearAllMocks()
})

const ONLINE_REQUEST_HREFS = [...ONLINE_SERVICE_REQUEST_PATHS]
const PENDING_REQUEST_HREFS = Object.values(SERVICE_REQUEST_ROUTES).filter(
  (href) => !ONLINE_SERVICE_REQUEST_PATHS.has(href),
)

const renderSection = () => renderToStaticMarkup(
  <MemoryRouter>
    <RequestsSection />
  </MemoryRouter>,
)

describe('RequestsSection', () => {
  it('muestra las ocho Cards públicas', () => {
    const markup = renderSection()

    expect((markup.match(/<article/g) ?? [])).toHaveLength(8)
    expect(markup).toContain('Solicitud de Arreglo de Pago Domiciliar')
    expect(markup).toContain('Cambio de Nombre del Titular del Servicio')
    expect(markup).toContain('Constancia de Servicio Existente')
    expect(markup).toContain('Otros Formularios')
    expect(markup).toContain('Seguimiento de Solicitudes')
  })

  it('enlaza solo trámites con formulario digital real (fuente única)', () => {
    const markup = renderSection()

    for (const href of ONLINE_REQUEST_HREFS) {
      expect(markup).toContain(`href="${href}"`)
    }
    for (const href of PENDING_REQUEST_HREFS) {
      expect(markup).not.toContain(`href="${href}"`)
    }
    expect((markup.match(/Realizar solicitud/g) ?? [])).toHaveLength(
      ONLINE_REQUEST_HREFS.length,
    )
    expect(markup).toContain('Trámite en línea')
    expect((markup.match(/Consultando formulario…/g) ?? [])).toHaveLength(6)
    expect(markup).toContain(
      `href="${SERVICE_REQUEST_ROUTES.existingService}"`,
    )
    expect(markup).not.toContain('Descarga disponible')
    expect(markup).not.toContain('/formularios/')
    expect(markup).not.toContain('download=""')
  })

  it('incluye adaptación móvil y foco visible en las acciones', () => {
    const markup = renderSection()

    expect(markup).toContain('max-[760px]:grid-cols-1')
    expect(markup).toContain('max-[520px]:grid-cols-1')
    expect((markup.match(/focus-visible:outline-3/g) ?? []).length).toBeGreaterThanOrEqual(8)
  })

  it('diferencia otros formularios de los trámites digitales', () => {
    const markup = renderSection()

    expect(markup).toContain('Solo descarga')
    expect(markup).toContain('href="/solicitudes/otros-formularios"')
    expect((markup.match(/Ver formularios/g) ?? [])).toHaveLength(1)
  })

  it('ofrece acceso público al seguimiento por código', () => {
    const markup = renderSection()

    expect(markup).toContain('Consulta pública')
    expect(markup).toContain('href="/solicitudes/seguimiento"')
    expect((markup.match(/Consultar solicitud/g) ?? [])).toHaveLength(1)
  })

  it('habilita cada PDF por su slug e informa los formularios no disponibles', async () => {
    vi.mocked(officialFormsApi.getFormulariosOficialesPublicos).mockResolvedValue(
      FORMULARIOS_OFICIALES_SLUGS.map((slug, index) => ({
        tipoSolicitudId: index + 1,
        nombre: slug,
        slug,
        tienePdf: slug !== 'cambio-titular',
        nombreArchivo: slug === 'cambio-titular' ? null : `${slug}.pdf`,
        fechaActualizacion: null,
        urlDescarga: slug === 'cambio-titular' ? null : `/solicitudes/${slug}/formulario-oficial`,
      })),
    )
    vi.mocked(officialFormsApi.downloadFormularioOficial).mockResolvedValue('arreglo.pdf')
    clientContainer = document.createElement('div')
    document.body.appendChild(clientContainer)
    clientRoot = createRoot(clientContainer)

    await act(async () => {
      clientRoot?.render(<MemoryRouter><RequestsSection /></MemoryRouter>)
    })

    const buttons = [...clientContainer.querySelectorAll('button')]
    expect(buttons.filter((button) => button.textContent?.includes('Descargar formulario'))).toHaveLength(5)
    expect(buttons.find((button) => button.textContent?.includes('Formulario no disponible'))?.disabled).toBe(true)

    await act(async () => buttons.find((button) => button.textContent?.includes('Descargar formulario'))?.click())
    const confirm = [...document.body.querySelectorAll('button')].find((button) => button.textContent?.includes('Descargar PDF'))
    await act(async () => confirm?.click())

    expect(officialFormsApi.downloadFormularioOficial).toHaveBeenCalledWith(
      'arreglo-pago',
      '/solicitudes/arreglo-pago/formulario-oficial',
    )
  })

  it('mantiene la descarga directa como respaldo si el catálogo no responde', async () => {
    vi.mocked(officialFormsApi.getFormulariosOficialesPublicos).mockRejectedValue(
      new Error('HTTP 404'),
    )
    vi.mocked(officialFormsApi.downloadFormularioOficial).mockResolvedValue('arreglo.pdf')
    clientContainer = document.createElement('div')
    document.body.appendChild(clientContainer)
    clientRoot = createRoot(clientContainer)

    await act(async () => {
      clientRoot?.render(<MemoryRouter><RequestsSection /></MemoryRouter>)
    })

    const downloadButtons = [...clientContainer.querySelectorAll('button')].filter(
      (button) => button.textContent?.includes('Descargar formulario'),
    )
    expect(downloadButtons).toHaveLength(6)
    expect(downloadButtons.every((button) => !button.disabled)).toBe(true)

    await act(async () => downloadButtons[0]?.click())
    const confirm = [...document.body.querySelectorAll('button')].find(
      (button) => button.textContent?.includes('Descargar PDF'),
    )
    await act(async () => confirm?.click())

    expect(officialFormsApi.downloadFormularioOficial).toHaveBeenCalledWith(
      'arreglo-pago',
      undefined,
    )
  })
})
