import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import InfraestructuraLinderosPage from './InfraestructuraLinderosPage'
import {
  CALIDADES_TITULAR,
  MEDIOS_NOTIFICACION,
  PROPOSITOS,
  TIPOS_PERSONA,
} from './types'

const renderPage = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <InfraestructuraLinderosPage />
    </MemoryRouter>,
  )

describe('InfraestructuraLinderosPage', () => {
  it('incluye los seis pasos y campos del servicio/titular', () => {
    const markup = renderPage()

    expect(markup).toContain('Paso 1 de 6')
    for (const field of ['nis', 'tipoPersona', 'calidadTitular']) {
      expect(markup).toContain(`name="${field}"`)
    }
    expect(markup).toContain('Datos del servicio y titular')
    expect(markup).toContain('Datos del inmueble')
    expect(markup).toContain('Propósito')
    expect(markup).toContain('Notificaciones')
    expect(markup).toContain('Documentos y firma')
    expect(markup).toContain('Revisión')
    expect(markup).toContain(
      'Constancia de Infraestructura Frente a Linderos de un Inmueble',
    )
  })

  it('ofrece exactamente las opciones oficiales de tipo, calidad, propósito y medios', () => {
    const markup = renderPage()

    for (const option of TIPOS_PERSONA) {
      expect(markup).toContain(`<option value="${option}">${option}</option>`)
    }
    for (const option of CALIDADES_TITULAR) {
      expect(markup).toContain(`<option value="${option}">${option}</option>`)
    }
    for (const option of PROPOSITOS) {
      expect(markup).toContain(`<option value="${option}">${option}</option>`)
    }
    for (const option of MEDIOS_NOTIFICACION) {
      expect(markup).toContain(`<option value="${option}">${option}</option>`)
    }
    expect(markup).not.toContain('<option value="WhatsApp">')
    expect(markup).not.toContain('<option value="Arrendatario">')
    expect(markup).not.toContain('<option value="Ampliación inventada">')
  })

  it('no expone campos administrativos editables', () => {
    const markup = renderPage()

    for (const adminField of [
      'estado',
      'solicitudId',
      'aprobadoPor',
      'revisadoPor',
      'funcionarioAsignado',
      'fechaAprobacion',
      'observacionAdministrativa',
    ]) {
      expect(markup).not.toContain(`name="${adminField}"`)
    }
  })

  it('incluye adaptación móvil y requisitos documentales de infraestructura-linderos', () => {
    const markup = renderPage()

    expect(markup).toContain('max-[680px]:grid-cols-1')
    expect(markup).toContain('max-[640px]:px-4')
    expect(markup).toContain('Documento de identificación')
    expect(markup).toContain('Plano catastrado')
    expect(markup).toContain('Plano de agrimensura')
    expect(markup).toContain('Firma digital')
  })
})
