import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import RequestsSection from './RequestsSection'

const OFFICIAL_REQUESTS = [
  ['Solicitud de Arreglo de Pago Domiciliar', '/solicitudes/arreglo-pago'],
  ['Cambio de Nombre del Titular del Servicio', '/solicitudes/cambio-titular'],
  ['Constancia de Infraestructura Frente a Linderos de un Inmueble', '/solicitudes/infraestructura-linderos'],
  ['Solicitud de Afiliación', '/solicitudes/afiliacion'],
  ['Constancia de Disponibilidad de Servicios', '/solicitudes/disponibilidad-servicios'],
  ['Constancia de Servicio Existente', '/solicitudes/servicio-existente'],
] as const

const renderSection = () => renderToStaticMarkup(
  <MemoryRouter>
    <RequestsSection />
  </MemoryRouter>,
)

describe('RequestsSection', () => {
  it('muestra las ocho Cards públicas', () => {
    const markup = renderSection()

    expect((markup.match(/<article/g) ?? [])).toHaveLength(8)
    for (const [name] of OFFICIAL_REQUESTS) expect(markup).toContain(name)
    expect(markup).toContain('Otros Formularios')
    expect(markup).toContain('Seguimiento de Solicitudes')
  })

  it('enlaza cada Card con su formulario y descarga el documento desde el backend', () => {
    const markup = renderSection()

    for (const [, formPath] of OFFICIAL_REQUESTS) {
      expect(markup).toContain(`href="${formPath}"`)
    }
    expect((markup.match(/Realizar solicitud/g) ?? [])).toHaveLength(6)
    expect((markup.match(/Forma Presencial/g) ?? [])).toHaveLength(6)
    expect(markup).not.toContain('/formularios/')
    expect(markup).not.toContain('download=""')
  })

  it('incluye adaptación móvil y foco visible en ambas acciones', () => {
    const markup = renderSection()

    expect(markup).toContain('max-[760px]:grid-cols-1')
    expect(markup).toContain('max-[520px]:grid-cols-1')
    expect((markup.match(/focus-visible:outline-3/g) ?? [])).toHaveLength(14)
  })

  it('diferencia otros formularios de los trÃ¡mites digitales', () => {
    const markup = renderSection()

    expect(markup).toContain('Solo descarga')
    expect(markup).toContain('href="/solicitudes/otros-formularios"')
    expect((markup.match(/Ver formularios/g) ?? [])).toHaveLength(1)
    expect((markup.match(/Realizar solicitud/g) ?? [])).toHaveLength(6)
  })

  it('ofrece acceso público al seguimiento por código', () => {
    const markup = renderSection()

    expect(markup).toContain('Consulta pública')
    expect(markup).toContain('href="/solicitudes/seguimiento"')
    expect((markup.match(/Consultar solicitud/g) ?? [])).toHaveLength(1)
  })
})
