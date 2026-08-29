import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProjectsPreview from './ProjectsPreview'
import * as proyectosApi from '../../proyectos/services/proyectosApi'

describe('ProjectsPreview', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  const renderComponent = async (props = {}) => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProjectsPreview {...props} />
        </MemoryRouter>,
      )
    })
  }

  it('muestra el estado de carga mientras consulta GET /v1/public/proyectos', async () => {
    vi.spyOn(proyectosApi, 'getPublicProyectos').mockReturnValue(
      new Promise(() => undefined),
    )

    await renderComponent()

    expect(container.textContent).toContain('Cargando proyectos...')
    expect(container.querySelector('[role="status"]')).not.toBeNull()
  })

  it('renderiza la lista de proyectos públicos devueltos por el backend con imagen, nombre, duración, estado en texto y botón Ver más', async () => {
    const proyectosMock: proyectosApi.PublicProyecto[] = [
      {
        id: 10,
        nombre: 'Acueducto Sector Sur',
        imagenPrincipal: '/cover.jpg',
        duracion: '6 meses',
        estado: 'EN_PROCESO',
      },
      {
        id: 11,
        nombre: 'Tanque Elevado Central',
        imagenPrincipal: null,
        duracion: '12 meses',
        estado: 'COMPLETADO',
      },
    ]

    vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(proyectosMock)

    await renderComponent()


    expect(container.textContent).toContain('Acueducto Sector Sur')
    expect(container.textContent).toContain('Tanque Elevado Central')
    expect(container.textContent).toContain('Duración: 6 meses')
    expect(container.textContent).toContain('Duración: 12 meses')
    expect(container.textContent).toContain('Estado: En proceso')
    expect(container.textContent).toContain('Estado: Completado')

    const moreButtons = container.querySelectorAll('.projects-preview__more-btn')
    expect(moreButtons.length).toBe(2)
    expect(moreButtons[0].textContent).toBe('Ver más')

    const img = container.querySelector('img[src="/cover.jpg"]')
    expect(img).not.toBeNull()
  })

  it('contiene un enlace Ver más apuntando a /proyectos/:id para cada tarjeta', async () => {
    const proyectosMock: proyectosApi.PublicProyecto[] = [
      {
        id: 10,
        nombre: 'Acueducto Sector Sur',
        imagenPrincipal: '/cover.jpg',
        duracion: '6 meses',
        estado: 'EN_PROCESO',
      },
    ]

    vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(proyectosMock)

    await renderComponent()

    const moreLink = container.querySelector(
      '.projects-preview__more-btn',
    ) as HTMLAnchorElement

    expect(moreLink).not.toBeNull()
    expect(moreLink.getAttribute('href')).toBe('/proyectos/10')
  })

  it('muestra mensaje amigable de lista vacía cuando no existen proyectos activos', async () => {
    vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce([])

    await renderComponent()

    expect(container.textContent).toContain('Actualmente no hay proyectos disponibles.')
    expect(container.querySelector('.projects-preview__card')).toBeNull()
  })

  it('muestra error y botón de reintento si falla la consulta', async () => {
    const spy = vi
      .spyOn(proyectosApi, 'getPublicProyectos')
      .mockRejectedValueOnce(new Error('HTTP 500: Error interno'))
      .mockResolvedValueOnce([])

    await renderComponent()

    expect(container.textContent).toContain('HTTP 500: Error interno')

    const retryBtn = container.querySelector(
      '.projects-preview__retry-btn',
    ) as HTMLButtonElement
    expect(retryBtn).not.toBeNull()

    await act(async () => {
      retryBtn.click()
    })

    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('permite navegar entre tarjetas utilizando los botones de control Anterior y Siguiente', async () => {
    const proyectosMock: proyectosApi.PublicProyecto[] = [
      { id: 1, nombre: 'Proyecto 1', duracion: '1m', estado: 'EN_PROCESO' },
      { id: 2, nombre: 'Proyecto 2', duracion: '2m', estado: 'EN_PROCESO' },
      { id: 3, nombre: 'Proyecto 3', duracion: '3m', estado: 'EN_PROCESO' },
      { id: 4, nombre: 'Proyecto 4', duracion: '4m', estado: 'COMPLETADO' },
      { id: 5, nombre: 'Proyecto 5', duracion: '5m', estado: 'PENDIENTE' },
    ]

    vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(proyectosMock)

    await renderComponent()

    const nextBtn = container.querySelector(
      '[aria-label="Siguiente proyecto"]',
    ) as HTMLButtonElement
    const prevBtn = container.querySelector(
      '[aria-label="Proyecto anterior"]',
    ) as HTMLButtonElement

    expect(prevBtn.textContent?.trim()).toBe('‹')
    expect(nextBtn.textContent?.trim()).toBe('›')
    expect(prevBtn.disabled).toBe(true)
    expect(nextBtn.disabled).toBe(false)

    await act(async () => {
      nextBtn.click()
    })

    expect(prevBtn.disabled).toBe(false)
    expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
      '2 / 3',
    )

    await act(async () => {
      prevBtn.click()
    })

    expect(prevBtn.disabled).toBe(true)
    expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
      '1 / 3',
    )
  })

  it('permite navegar mediante el teclado (ArrowRight y ArrowLeft) al enfocar el carrusel', async () => {
    const proyectosMock: proyectosApi.PublicProyecto[] = [
      { id: 1, nombre: 'Proyecto 1', duracion: '1m', estado: 'EN_PROCESO' },
      { id: 2, nombre: 'Proyecto 2', duracion: '2m', estado: 'EN_PROCESO' },
      { id: 3, nombre: 'Proyecto 3', duracion: '3m', estado: 'EN_PROCESO' },
      { id: 4, nombre: 'Proyecto 4', duracion: '4m', estado: 'COMPLETADO' },
    ]

    vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(proyectosMock)

    await renderComponent()

    const viewport = container.querySelector(
      '.projects-preview__viewport',
    ) as HTMLDivElement

    expect(viewport).not.toBeNull()

    await act(async () => {
      viewport.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      )
    })

    expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
      '2 / 2',
    )

    await act(async () => {
      viewport.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
      )
    })

    expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
      '1 / 2',
    )
  })

  it('permite saltar directamente a una página usando la barra de puntos', async () => {
    const proyectosMock: proyectosApi.PublicProyecto[] = [
      { id: 1, nombre: 'Proyecto 1', duracion: '1m', estado: 'EN_PROCESO' },
      { id: 2, nombre: 'Proyecto 2', duracion: '2m', estado: 'EN_PROCESO' },
      { id: 3, nombre: 'Proyecto 3', duracion: '3m', estado: 'EN_PROCESO' },
      { id: 4, nombre: 'Proyecto 4', duracion: '4m', estado: 'COMPLETADO' },
    ]

    vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(proyectosMock)

    await renderComponent()

    const dots = container.querySelectorAll('.projects-preview__dot')
    expect(dots.length).toBe(2)

    await act(async () => {
      ;(dots[1] as HTMLButtonElement).click()
    })

    expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
      '2 / 2',
    )
    expect(dots[1].classList.contains('is-active')).toBe(true)
  })

  it('respeta las props id y title pasadas por parámetro', async () => {
    vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce([])

    await renderComponent({ id: 'seccion-obras', title: 'Obras Institucionales' })

    const section = container.querySelector('#seccion-obras')
    expect(section).not.toBeNull()
    expect(container.textContent).toContain('Obras Institucionales')
  })

  it('conecta el título, imagen y botón de cada tarjeta hacia /proyectos/:id usando el ID real', async () => {
    const proyectosMock: proyectosApi.PublicProyecto[] = [
      {
        id: 42,
        nombre: 'Tanque Reserva San Juan',
        imagenPrincipal: '/tanque.jpg',
        duracion: '3 meses',
        estado: 'EN_PROCESO',
      },
    ]

    vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(proyectosMock)

    await renderComponent()

    const titleLink = container.querySelector(
      '.projects-preview__card-title-link',
    ) as HTMLAnchorElement
    const thumbLink = container.querySelector(
      '.projects-preview__card-thumb',
    ) as HTMLAnchorElement
    const moreLink = container.querySelector(
      '.projects-preview__more-btn',
    ) as HTMLAnchorElement

    expect(titleLink).not.toBeNull()
    expect(titleLink.getAttribute('href')).toBe('/proyectos/42')
    expect(thumbLink.getAttribute('href')).toBe('/proyectos/42')
    expect(moreLink.getAttribute('href')).toBe('/proyectos/42')
  })
})




