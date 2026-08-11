import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import TransparencySection from './TransparencySection'

const mockUsePublicTransparencia = vi.fn()

vi.mock('./usePublicTransparencia', () => ({
  usePublicTransparencia: (...args: unknown[]) =>
    mockUsePublicTransparencia(...args),
}))

describe('TransparencySection', () => {
  beforeEach(() => {
    mockUsePublicTransparencia.mockReturnValue({
      status: 'success',
      publications: [],
      total: 0,
      retry: vi.fn(),
    })
  })

  it('muestra mensaje vacío en modo controlado sin publicaciones', () => {
    const markup = renderToStaticMarkup(
      <TransparencySection
        publications={[]}
        emptyMessage="Sin documentos por ahora."
      />,
    )

    expect(markup).toContain('Sin documentos por ahora.')
    expect(markup).toContain('transparency-section__empty')
    expect(markup).not.toContain('transparency-section__grid')
    expect(mockUsePublicTransparencia).toHaveBeenCalledWith(false)
  })

  it('renderiza tarjetas en el orden recibido', () => {
    const markup = renderToStaticMarkup(
      <TransparencySection
        publications={[
          {
            id: '1',
            name: 'Informe anual',
            description: 'Resumen del informe.',
            fileUrl: '/uploads/transparencia/informe.pdf',
            fileType: 'pdf',
          },
          {
            id: '2',
            name: 'Muestreo',
            description: 'Fotografía del punto.',
            fileUrl: '/uploads/transparencia/muestreo.jpg',
            fileType: 'jpg',
          },
        ]}
      />,
    )

    expect(markup).toContain('transparency-section__grid')
    expect(markup.indexOf('Informe anual')).toBeLessThan(
      markup.indexOf('Muestreo'),
    )
    expect(markup).toContain('Ver documento')
    expect(markup).toContain('Ver imagen')
  })

  it('muestra estado de carga cuando consulta el API', () => {
    mockUsePublicTransparencia.mockReturnValue({
      status: 'loading',
      publications: [],
      total: 0,
      retry: vi.fn(),
    })

    const markup = renderToStaticMarkup(<TransparencySection />)

    expect(markup).toContain('Cargando documentación')
    expect(mockUsePublicTransparencia).toHaveBeenCalledWith(true)
  })

  it('muestra error y botón de reintento cuando falla la consulta', () => {
    mockUsePublicTransparencia.mockReturnValue({
      status: 'error',
      publications: [],
      total: 0,
      retry: vi.fn(),
    })

    const markup = renderToStaticMarkup(
      <TransparencySection errorMessage="Error al cargar." />,
    )

    expect(markup).toContain('Error al cargar.')
    expect(markup).toContain('Reintentar')
    expect(markup).toContain('role="alert"')
  })
})
