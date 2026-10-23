import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import {
  ONLINE_SERVICE_REQUEST_PATHS,
  SERVICE_REQUEST_ROUTES,
} from '../config/serviceRequestRoutes'
import RequestsSection from './RequestsSection'

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
    expect(markup).toContain('Forma presencial')
    expect(markup).toContain(
      'El formulario en línea estará disponible próximamente.',
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
})
