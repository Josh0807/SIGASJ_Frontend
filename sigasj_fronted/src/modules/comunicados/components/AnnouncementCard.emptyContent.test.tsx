import { afterEach, describe, expect, it } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import AnnouncementCard from './AnnouncementCard'

describe('AnnouncementCard sin descripción', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('muestra un comunicado con título e imagen aunque no tenga descripción ni contenido', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    await act(async () => { root.render(<AnnouncementCard id="1" title="Cuido del agua" summary="" imageUrl="http://localhost:3000/uploads/comunicados/aviso.jpg" />) })
    expect(host.textContent).toContain('Cuido del agua')
    expect(host.querySelector('img')?.getAttribute('src')).toContain('/uploads/comunicados/aviso.jpg')
    await act(async () => root.unmount())
  })

  it('sigue descartando elementos sin título', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    await act(async () => { root.render(<AnnouncementCard id="2" title=" " summary="Texto" />) })
    expect(host.innerHTML).toBe('')
    await act(async () => root.unmount())
  })
})
