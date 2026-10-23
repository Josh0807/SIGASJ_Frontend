import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import CambioTitularPage from './CambioTitularPage'
import {
  CALIDADES_TITULAR,
  MEDIOS_NOTIFICACION,
  NATURALEZAS_INMUEBLE,
} from './types'

const renderPage = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <CambioTitularPage />
    </MemoryRouter>,
  )

describe('CambioTitularPage', () => {
  it('incluye los seis pasos y los campos públicos del DTO', () => {
    const markup = renderPage()

    expect(markup).toContain('Paso 1 de 6')
    for (const field of [
      'nombreSolicitante',
      'identificacionSolicitante',
      'telefono',
    ]) {
      expect(markup).toContain(`name="${field}"`)
    }
    expect(markup).toContain('Datos del solicitante')
    expect(markup).toContain('Propietario e inmueble')
    expect(markup).toContain('Información del servicio')
    expect(markup).toContain('Notificaciones')
    expect(markup).toContain('Documentos y firma')
    expect(markup).toContain('Revisión')
    expect(markup).toContain(
      'Comprueba toda la información antes de registrar la solicitud.',
    )
  })

  it('ofrece exactamente las opciones oficiales de naturaleza, calidad y medios', () => {
    const markup = renderPage()

    for (const option of NATURALEZAS_INMUEBLE) {
      expect(markup).toContain(`<option value="${option}">${option}</option>`)
    }
    for (const option of CALIDADES_TITULAR) {
      expect(markup).toContain(`<option value="${option}">${option}</option>`)
    }
    for (const option of MEDIOS_NOTIFICACION) {
      expect(markup).toContain(`<option value="${option}">${option}</option>`)
    }
    expect(markup).not.toContain('<option value="Alquilado">')
    expect(markup).not.toContain('<option value="WhatsApp">')
    expect(markup).not.toContain('<option value="Arrendatario">')
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

  it('incluye adaptación móvil y requisitos documentales de cambio-titular', () => {
    const markup = renderPage()

    expect(markup).toContain('max-[680px]:grid-cols-1')
    expect(markup).toContain('max-[640px]:px-4')
    expect(markup).toContain('Documento de identificación vigente')
    expect(markup).toContain('Poder o autorización')
    expect(markup).toContain(
      'Documento que acredite la posesión de un inmueble sin inscribir',
    )
    expect(markup).toContain('Firma digital')
  })
})
