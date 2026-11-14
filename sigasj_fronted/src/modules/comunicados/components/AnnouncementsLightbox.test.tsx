import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import AnnouncementsSection from './AnnouncementsSection'

describe('visor de imágenes de comunicados', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  })

  it('abre el lightbox en body, permite zoom y bloquea el scroll sin saltar', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)

    await act(async () =>
      root.render(
        <AnnouncementsSection
          announcements={[
            { id: '1', title: 'Aviso uno', imageUrl: '/uno.jpg' },
            { id: '2', title: 'Aviso dos', imageUrl: '/dos.jpg' },
          ]}
        />,
      ),
    )

    const scrollBefore = 1420
    document.documentElement.scrollTop = scrollBefore
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => document.documentElement.scrollTop,
    })

    const open = host.querySelector<HTMLButtonElement>(
      '[aria-label="Ver comunicado: Aviso uno"]',
    )
    await act(async () => open?.click())

    const lightbox = document.body.querySelector('.announcement-lightbox')
    expect(lightbox).not.toBeNull()
    expect(host.contains(lightbox)).toBe(false)
    expect(lightbox?.textContent).toContain('1 / 2')
    expect(lightbox?.textContent).toContain('Aviso uno')
    expect(document.body.querySelector('[aria-label="Comunicado siguiente"]')).not.toBeNull()
    expect(document.body.querySelector('[aria-label="Cerrar comunicado"]')).not.toBeNull()

    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.style.position).not.toBe('fixed')
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.documentElement.scrollTop).toBe(scrollBefore)
    expect(window.scrollY).toBe(scrollBefore)

    const zoomIn = document.body.querySelector<HTMLButtonElement>(
      '[aria-label="Acercar imagen"]',
    )
    const zoomOut = document.body.querySelector<HTMLButtonElement>(
      '[aria-label="Alejar imagen"]',
    )
    const zoomReset = document.body.querySelector<HTMLButtonElement>(
      '[aria-label="Restablecer zoom"]',
    )
    expect(zoomIn).not.toBeNull()
    expect(zoomOut).not.toBeNull()
    expect(zoomReset).not.toBeNull()
    expect(zoomOut?.disabled).toBe(true)
    expect(zoomReset?.disabled).toBe(true)

    await act(async () => zoomIn?.click())
    expect(lightbox?.textContent).toContain('150%')
    expect(zoomOut?.disabled).toBe(false)
    expect(zoomReset?.disabled).toBe(false)
    expect(document.documentElement.scrollTop).toBe(scrollBefore)

    await act(async () => zoomOut?.click())
    expect(lightbox?.textContent).toContain('100%')
    expect(zoomOut?.disabled).toBe(true)
    expect(zoomReset?.disabled).toBe(true)

    await act(async () => zoomIn?.click())
    await act(async () => zoomReset?.click())
    expect(lightbox?.textContent).toContain('100%')

    const close = document.body.querySelector<HTMLButtonElement>(
      '[aria-label="Cerrar comunicado"]',
    )
    await act(async () => close?.click())

    expect(document.body.querySelector('.announcement-lightbox')).toBeNull()
    expect(document.documentElement.scrollTop).toBe(scrollBefore)
    expect(window.scrollY).toBe(scrollBefore)
    expect(document.body.style.overflow).toBe('')
    expect(document.documentElement.style.overflow).toBe('')

    await act(async () => root.unmount())
  })
})
