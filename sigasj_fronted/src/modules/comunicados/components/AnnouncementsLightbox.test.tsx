import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import AnnouncementsSection from './AnnouncementsSection'

describe('visor de imágenes de comunicados', () => {
  afterEach(() => { document.body.innerHTML = ''; document.body.style.overflow = '' })
  it('reutiliza el lightbox de galería y permite navegar entre imágenes', async () => {
    const host = document.createElement('div'); document.body.appendChild(host); const root = createRoot(host)
    await act(async () => root.render(<AnnouncementsSection announcements={[{ id: '1', title: 'Aviso uno', imageUrl: '/uno.jpg' }, { id: '2', title: 'Aviso dos', imageUrl: '/dos.jpg' }]} />))
    const open = host.querySelector<HTMLButtonElement>('[aria-label="Ver imagen ampliada: Aviso uno"]')
    await act(async () => open?.click())
    expect(host.querySelector('.gallery-lightbox')).not.toBeNull()
    expect(host.textContent).toContain('1 de 2')
    expect(host.querySelector('[aria-label="Fotografía siguiente"]')).not.toBeNull()
    expect(host.querySelector('[aria-label="Cerrar vista ampliada"]')).not.toBeNull()
    await act(async () => root.unmount())
  })
})
