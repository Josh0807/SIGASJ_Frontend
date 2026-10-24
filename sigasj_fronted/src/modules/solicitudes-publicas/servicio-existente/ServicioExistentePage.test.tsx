import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ServicioExistentePage from './ServicioExistentePage'
import { MEDIOS_NOTIFICACION, MOTIVOS, TIPOS_SERVICIO } from './types'

const renderPage = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <ServicioExistentePage />
    </MemoryRouter>,
  )

describe('ServicioExistentePage', () => {
  it('expone los siete pasos y todos los campos ciudadanos del formulario', () => {
    const markup = renderPage()
    expect(markup).toContain('Paso 1 de 7')
    expect(markup).toContain('Constancia de Servicio Existente')

    for (const field of [
      'tipoServicio', 'nis', 'propietarioInmueble', 'nombreSolicitante',
      'identificacionSolicitante', 'correoElectronico', 'telefono',
      'naturalezaInmueble', 'calidadTitular', 'folioReal', 'planoCatastrado',
      'planoAgrimensura', 'provincia', 'canton', 'distrito', 'direccionExacta',
      'motivo', 'tramitePorRealizar', 'medioNotificacionPrincipal',
      'medioNotificacionSecundario',
    ]) {
      expect(markup).toContain(`name="${field}"`)
    }
    expect(markup).toContain('Documentación requerida')
    expect(markup).toContain('Firma digital')
  })

  it('ofrece ambos tipos, todos los motivos y los medios aceptados por backend', () => {
    const markup = renderPage()
    for (const option of [...TIPOS_SERVICIO, ...MOTIVOS, ...MEDIOS_NOTIFICACION]) {
      expect(markup).toContain(`<option>${option}</option>`)
    }
    expect(MOTIVOS).toHaveLength(7)
  })

  it('no expone campos administrativos y conserva adaptación móvil', () => {
    const markup = renderPage()
    for (const field of ['estado', 'codigoSeguimiento', 'fechaIngreso', 'solicitudId', 'funcionarioAsignado']) {
      expect(markup).not.toContain(`name="${field}"`)
    }
    expect(markup).toContain('max-[680px]:grid-cols-1')
    expect(markup).toContain('max-[640px]:px-4')
  })
})
