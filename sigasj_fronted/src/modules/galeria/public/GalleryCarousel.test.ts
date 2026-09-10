import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const component = readFileSync('src/modules/galeria/public/GallerySection.tsx', 'utf8')
const css = readFileSync('src/index.css', 'utf8')

describe('carrusel responsive de galería', () => {
  it('dispone controles accesibles y desplazamiento suave', () => {
    expect(component).toContain('Ver fotografías anteriores')
    expect(component).toContain('Ver fotografías siguientes')
    expect(component).toContain("behavior: 'smooth'")
    expect(component).toContain('gallery-section__status')
    expect(component).toContain('gallery-section__dots')
    expect(component).toContain('tabIndex={0}')
  })

  it('mantiene las fotografías en una fila desplazable', () => {
    expect(css).toContain('.gallery-section__grid {')
    expect(css).toContain('display: flex;')
    expect(css).toContain('overflow-x: auto;')
    expect(css).toContain('scroll-snap-type: x mandatory;')
    expect(css).toContain('scrollbar-width: none;')
    expect(css).toContain('.gallery-section__grid::-webkit-scrollbar')
  })

  it('adapta las tarjetas para tableta y celular', () => {
    expect(css).toContain('flex-basis: calc((100% - 22px) / 2);')
    expect(css).toContain('flex-basis: min(86%, 22rem);')
    expect(css).toContain('.gallery-section__swipe-hint')
  })
})
