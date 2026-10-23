import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import AfiliacionPage from './AfiliacionPage'

const renderPage = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <AfiliacionPage />
    </MemoryRouter>,
  )

describe('AfiliacionPage', () => {
  it('incluye los seis pasos oficiales', () => {
    const markup = renderPage()

    expect(markup).toContain('Paso 1 de 6')
    expect(markup).toContain('Datos personales')
    expect(markup).toContain('Datos del abonado e inmueble')
    expect(markup).toContain('Primera recomendación')
    expect(markup).toContain('Segunda recomendación')
    expect(markup).toContain('Firma')
    expect(markup).toContain('Revisión')
    expect(markup).toContain('Solicitud de Afiliación')
  })

  it('expone campos públicos del DTO 4.7.2', () => {
    const markup = renderPage()

    for (const field of [
      'fechaSolicitud',
      'nombre',
      'identificacion',
      'vecinoDe',
      'estadoCivil',
      'telefono',
      'correoElectronico',
      'numeroAbonado',
      'numeroPlano',
      'folioReal',
    ]) {
      expect(markup).toContain(`name="${field}"`)
    }
  })

  it('mantiene nombres de campo independientes para ambas recomendaciones', () => {
    const markup = renderPage()

    for (const field of [
      'recomendacion1Nombre',
      'recomendacion1Identificacion',
      'recomendacion1NumeroAbonado',
      'recomendacion2Nombre',
      'recomendacion2Identificacion',
      'recomendacion2NumeroAbonado',
    ]) {
      expect(markup).toContain(`name="${field}"`)
    }
    expect(markup).not.toContain('name="recomendacionNombre"')
  })

  it('no expone campos administrativos de Junta Directiva', () => {
    const markup = renderPage()

    for (const adminField of [
      'estado',
      'solicitudId',
      'fechaSesion',
      'numeroAcuerdo',
      'resultado',
      'aprobado',
      'rechazado',
      'observacionesJunta',
      'firmaJunta',
      'revisadoPor',
      'aprobadoPor',
    ]) {
      expect(markup).not.toContain(`name="${adminField}"`)
    }
  })

  it('incluye adaptación móvil y firma opcional del solicitante', () => {
    const markup = renderPage()

    expect(markup).toContain('max-[680px]:grid-cols-1')
    expect(markup).toContain('max-[640px]:px-4')
    expect(markup).toContain('Firma del solicitante')
  })
})
