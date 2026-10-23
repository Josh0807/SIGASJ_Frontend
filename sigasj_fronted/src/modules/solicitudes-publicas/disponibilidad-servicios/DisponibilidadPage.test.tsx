import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import DisponibilidadPage from './DisponibilidadPage'
import {
  CALIDADES_TITULAR,
  MEDIOS_NOTIFICACION,
  NATURALEZAS_INMUEBLE,
  PROPOSITOS,
  TIPOS_PERSONA,
} from './types'

const renderPage = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <DisponibilidadPage />
    </MemoryRouter>,
  )

describe('DisponibilidadPage', () => {
  it('incluye los nueve pasos y campos del solicitante', () => {
    const markup = renderPage()

    expect(markup).toContain('Paso 1 de 9')
    expect(markup).toContain('name="tipoPersona"')
    expect(markup).toContain('Datos del solicitante')
    expect(markup).toContain('Medios de notificación')
    expect(markup).toContain('Datos del inmueble')
    expect(markup).toContain('Naturaleza y calidad')
    expect(markup).toContain('Propósito')
    expect(markup).toContain('Información del proyecto')
    expect(markup).toContain('Documentos y autorización')
    expect(markup).toContain('Firma')
    expect(markup).toContain('Revisión')
    expect(markup).toContain('Constancia de Disponibilidad de Servicios')
  })

  it('ofrece exactamente las opciones oficiales de tipo, naturaleza, calidad, propósito y medios', () => {
    const markup = renderPage()

    for (const option of TIPOS_PERSONA) {
      expect(markup).toContain(`<option value="${option}">${option}</option>`)
    }
    for (const option of NATURALEZAS_INMUEBLE) {
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

  it('incluye adaptación móvil y campos de proyecto', () => {
    const markup = renderPage()

    expect(markup).toContain('max-[680px]:grid-cols-1')
    expect(markup).toContain('max-[640px]:px-4')
    expect(markup).toContain('name="descripcionProyecto"')
    expect(markup).toContain('name="cantidadDormitorios"')
    expect(markup).toContain('name="unidadesHabitacionales"')
    expect(markup).toContain('name="areaConstruccion"')
    expect(markup).toContain('name="niveles"')
    expect(markup).toContain('name="caudalRequerido"')
    expect(markup).toContain('name="numeroDisponibilidadAnterior"')
    expect(markup).toContain('Autorización de inspección')
    expect(markup).toContain('Firma del solicitante')
  })
})
