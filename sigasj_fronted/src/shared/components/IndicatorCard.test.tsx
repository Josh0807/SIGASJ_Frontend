import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import IndicatorCard from './IndicatorCard'

describe('IndicatorCard', () => {
  it('renderiza título, valor y descripción correctamente', () => {
    const markup = renderToStaticMarkup(
      <IndicatorCard
        title="Asociados activos"
        value="1,248"
        description="Padrón actualizado"
      />,
    )

    expect(markup).toContain('Asociados activos')
    expect(markup).toContain('1,248')
    expect(markup).toContain('Padrón actualizado')
    expect(markup).not.toContain('indicator-card__value--unavailable')
  })

  it('diferencia correctamente el número cero (0) de un valor no disponible (null/undefined)', () => {
    const markupZeroNumber = renderToStaticMarkup(
      <IndicatorCard title="Averías pendientes" value={0} />,
    )
    const markupZeroString = renderToStaticMarkup(
      <IndicatorCard title="Averías pendientes" value="0" />,
    )

    // El número 0 es un dato numérico válido y debe renderizarse como "0" sin marcarse como unavailable
    expect(markupZeroNumber).toContain('0')
    expect(markupZeroNumber).not.toContain('indicator-card__value--unavailable')
    expect(markupZeroString).toContain('0')
    expect(markupZeroString).not.toContain('indicator-card__value--unavailable')
  })

  it('muestra el valor fallback por defecto ("N/D") cuando el valor es null o undefined', () => {
    const markupNull = renderToStaticMarkup(
      <IndicatorCard title="Lecturas pendientes" value={null} />,
    )
    const markupUndefined = renderToStaticMarkup(
      <IndicatorCard title="Lecturas pendientes" value={undefined} />,
    )
    const markupEmpty = renderToStaticMarkup(
      <IndicatorCard title="Lecturas pendientes" value="" />,
    )

    expect(markupNull).toContain('N/D')
    expect(markupNull).toContain('indicator-card__value--unavailable')
    expect(markupUndefined).toContain('N/D')
    expect(markupUndefined).toContain('indicator-card__value--unavailable')
    expect(markupEmpty).toContain('N/D')
    expect(markupEmpty).toContain('indicator-card__value--unavailable')
  })

  it('renderiza la vista Skeleton cuando isLoading es true', () => {
    const markup = renderToStaticMarkup(
      <IndicatorCard title="Lecturas de agua" value={100} isLoading={true} />,
    )

    expect(markup).toContain('indicator-card--loading')
    expect(markup).toContain('aria-busy="true"')
    expect(markup).toContain('indicator-card__skeleton')
    expect(markup).not.toContain('100')
  })

  it('renderiza la vista de Error y el botón de reintento cuando isError es true', () => {
    const onRetryMock = vi.fn()
    const markup = renderToStaticMarkup(
      <IndicatorCard
        title="Lecturas de agua"
        isError={true}
        errorMessage="Error de conexión con el servidor"
        onRetry={onRetryMock}
      />,
    )

    expect(markup).toContain('indicator-card--error')
    expect(markup).toContain('Error al cargar')
    expect(markup).toContain('Error de conexión con el servidor')
    expect(markup).toContain('Reintentar')
  })

  it('permite personalizar el texto fallback cuando el valor no está disponible', () => {
    const markup = renderToStaticMarkup(
      <IndicatorCard
        title="Averías reportadas"
        value={null}
        fallbackText="Sin registro"
      />,
    )

    expect(markup).toContain('Sin registro')
    expect(markup).not.toContain('N/D')
  })

  it('renderiza badge y tipo de badge cuando se especifican', () => {
    const markup = renderToStaticMarkup(
      <IndicatorCard
        title="Solicitudes"
        value={15}
        badgeText="En revisión"
        badgeType="warning"
      />,
    )

    expect(markup).toContain('En revisión')
    expect(markup).toContain('indicator-card__badge--warning')
  })

  it('renderiza un enlace navegable cuando se proporciona la prop link', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <IndicatorCard title="Galería" value={42} link="/admin/galeria" />
      </MemoryRouter>,
    )

    expect(markup).toContain('href="/admin/galeria"')
    expect(markup).toContain('indicator-card--interactive')
    expect(markup).toContain('Ver detalles')
  })

  it('renderiza un ícono cuando se pasa en las props', () => {
    const markup = renderToStaticMarkup(
      <IndicatorCard
        title="Icon test"
        value={10}
        icon={<svg data-testid="custom-icon" />}
      />,
    )

    expect(markup).toContain('data-testid="custom-icon"')
  })
})
