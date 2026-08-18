import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { LANDING_SECTION_IDS } from '../config/landingSections'
import LandingPage from '../pages/LandingPage'

const landingPageSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../pages/LandingPage.tsx'),
  'utf8',
)

const renderLanding = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )

describe('LandingPage', () => {
  it('carga como contenedor de header, bienvenida, secciones y pie', () => {
    const markup = renderLanding()

    expect(markup).toContain('header__inner')
    expect(markup).toContain('navbar')
    expect(markup).toContain('hero')
    expect(markup).toContain('id="hero-title"')
    expect(markup).toContain('<footer')
    expect(markup).toContain('footer__content')
  })

  it('muestra las secciones principales en el orden definido', () => {
    const markup = renderLanding()
    const positions = LANDING_SECTION_IDS.map((id) => markup.indexOf(`id="${id}"`))

    expect(positions.every((position) => position >= 0)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
  })

  it('organiza la pagina con componentes independientes', () => {
    expect(landingPageSource).toContain('import Header')
    expect(landingPageSource).toContain('import HeroSection')
    expect(landingPageSource).toContain('import Footer')
    expect(landingPageSource).toContain('LANDING_SECTIONS')
    expect(landingPageSource).not.toContain('about-section__')
    expect(landingPageSource).not.toContain('hero__eyebrow')
    expect(landingPageSource).not.toContain('footer__brand')
  })

  it('no mezcla el panel administrativo en la pagina publica', () => {
    const markup = renderLanding()

    expect(markup).not.toContain('admin-layout')
    expect(markup).not.toContain('admin-sidebar')
    expect(markup).not.toContain('admin-header')
    expect(markup).not.toContain('Panel administrativo')
  })

  it('no emite errores de consola al renderizar', () => {
    const errors: unknown[] = []
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args)
    }

    try {
      renderLanding()
    } finally {
      console.error = originalError
    }

    expect(errors).toEqual([])
  })
})
