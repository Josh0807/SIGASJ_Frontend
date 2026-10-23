import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ArregloPagoPage from './ArregloPagoPage'
import { PLAZOS_ARREGLO_PAGO } from './types'

const renderPage = () => renderToStaticMarkup(
  <MemoryRouter>
    <ArregloPagoPage />
  </MemoryRouter>,
)

describe('ArregloPagoPage', () => {
  it('incluye los cuatro pasos y todos los campos del contrato ciudadano', () => {
    const markup = renderPage()

    expect(markup).toContain('Paso 1 de 4')
    for (const field of ['nombre', 'cedula', 'vecinoDe', 'telefono', 'numeroCuentaServicio', 'montoPrimaInicial', 'plazoSeleccionado', 'documentos']) {
      expect(markup).toContain(`name="${field}"`)
    }
    expect(markup).toContain('Firma digital')
    expect(markup).toContain('Revisión')
    expect(markup).toContain('Comprueba toda la información antes de registrar la solicitud.')
  })

  it('ofrece exactamente los ocho plazos oficiales sin seleccionar uno por defecto', () => {
    const markup = renderPage()

    expect(markup).toContain('<option value="" selected="">Seleccione un plazo…</option>')
    for (const plazo of PLAZOS_ARREGLO_PAGO) {
      expect(markup).toContain(`<option value="${plazo}">${plazo}</option>`)
      expect(markup).not.toContain(`<option value="${plazo}" selected="">`)
    }
  })

  it('incluye adaptación para móvil y selector múltiple de documentos', () => {
    const markup = renderPage()

    expect(markup).toContain('max-[680px]:grid-cols-1')
    expect(markup).toContain('max-[640px]:px-4')
    expect(markup).toContain('type="file" multiple=""')
  })
})
