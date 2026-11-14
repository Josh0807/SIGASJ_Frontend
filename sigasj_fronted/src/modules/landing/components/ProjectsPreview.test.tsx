import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProjectsPreview from './ProjectsPreview'
import * as proyectosApi from '../../proyectos/services/proyectosApi'

describe('ProjectsPreview — Testing / Frontend / Integración', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }),
    })
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

  const triggerTouchEvent = (
    element: HTMLElement,
    type: 'touchstart' | 'touchmove' | 'touchend',
    touches?: { clientX: number; clientY: number }[],
  ) => {
    const event = new Event(type, {
      bubbles: true,
      cancelable: true,
    }) as Event & {
      targetTouches: { clientX: number; clientY: number }[]
      touches: { clientX: number; clientY: number }[]
      changedTouches: { clientX: number; clientY: number }[]
    }
    event.targetTouches = touches || []
    event.touches = touches || []
    event.changedTouches = touches || []
    element.dispatchEvent(event)
  }

  describe('Estados de consulta (Carga, Error, Vacío)', () => {
    it('Carga: muestra indicador accesible role="status" mientras se obtienen los proyectos', async () => {
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockReturnValue(
        new Promise(() => undefined),
      )

      await renderComponent()

      expect(container.textContent).toContain('Cargando proyectos...')
      const statusElement = container.querySelector('[role="status"]')
      expect(statusElement).not.toBeNull()
      expect(statusElement?.textContent).toContain('Cargando proyectos...')
    })

    it('Error: muestra mensaje accesible role="alert" y permite reintentar la consulta', async () => {
      const spy = vi
        .spyOn(proyectosApi, 'getPublicProyectos')
        .mockRejectedValueOnce(new Error('HTTP 500: Error en el servidor'))
        .mockResolvedValueOnce([])

      await renderComponent()

      const alertEl = container.querySelector('[role="alert"]')
      expect(alertEl).not.toBeNull()
      expect(container.textContent).toContain(
        'No fue posible cargar los proyectos. Intente de nuevo más tarde.',
      )

      const retryBtn = container.querySelector(
        '.projects-preview__retry-btn',
      ) as HTMLButtonElement
      expect(retryBtn).not.toBeNull()
      expect(retryBtn.textContent?.trim()).toBe('Reintentar')

      await act(async () => {
        retryBtn.click()
      })

      expect(spy).toHaveBeenCalledTimes(2)
    })

    it('Vacío: muestra mensaje amigable cuando no existen proyectos activos disponibles', async () => {
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce([])

      await renderComponent()

      expect(container.textContent).toContain('Actualmente no hay proyectos disponibles.')
      const emptyEl = container.querySelector('[role="status"]')
      expect(emptyEl).not.toBeNull()
      expect(container.querySelector('.projects-preview__card')).toBeNull()
    })
  })

  describe('Proyecto activo e inactivo', () => {
    it('Proyecto activo: renderiza en grilla los proyectos activos (1–3)', async () => {
      const proyectosActivosMock: proyectosApi.PublicProyecto[] = [
        {
          id: 1,
          nombre: 'Construcción Tanque San Juan',
          imagenPrincipal: '/img/tanque.jpg',
          duracion: '4 meses',
          estado: 'EN_PROCESO',
        },
        {
          id: 2,
          nombre: 'Sustitución de Tuberías Sector Norte',
          imagenPrincipal: '/img/tuberias.jpg',
          duracion: '2 meses',
          estado: 'COMPLETADO',
        },
      ]

      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(
        proyectosActivosMock,
      )

      await renderComponent()

      const cards = container.querySelectorAll('.projects-preview__card')
      expect(cards.length).toBe(2)
      expect(container.textContent).toContain('Construcción Tanque San Juan')
      expect(container.textContent).toContain('Sustitución de Tuberías Sector Norte')
      expect(container.querySelector('[data-ui="projects-preview__grid"]')).not.toBeNull()
      expect(container.querySelector('[data-ui="projects-preview__carousel"]')).toBeNull()
    })

    it('Proyecto inactivo: cuando el backend no retorna proyectos inactivos en el endpoint público, la interfaz no los renderiza', async () => {
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce([])

      await renderComponent()

      expect(container.querySelector('.projects-preview__card')).toBeNull()
      expect(container.textContent).toContain('Actualmente no hay proyectos disponibles.')
    })
  })

  describe('Estructura de Card y campos (Nombre, Imagen, Duración, Estado, Ver más)', () => {
    it('Card y Nombre: estructura semántica <article> con enlaces accesibles y título h3', async () => {
      const proyectosMock: proyectosApi.PublicProyecto[] = [
        {
          id: 20,
          nombre: 'Planta de Tratamiento La Colina',
          imagenPrincipal: '/planta.jpg',
          duracion: '10 meses',
          estado: 'PENDIENTE',
        },
      ]

      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(proyectosMock)

      await renderComponent()

      const card = container.querySelector('.projects-preview__card')
      expect(card).not.toBeNull()
      expect(card?.tagName.toLowerCase()).toBe('article')

      const titleLink = container.querySelector(
        '.projects-preview__card-title-link',
      ) as HTMLAnchorElement
      expect(titleLink).not.toBeNull()
      expect(titleLink.textContent).toBe('Planta de Tratamiento La Colina')
      expect(titleLink.getAttribute('href')).toBe('/proyectos/20')
    })

    it('Imagen: renderiza <img> con alt descriptivo cuando existe imagenPrincipal', async () => {
      const proyectosMock: proyectosApi.PublicProyecto[] = [
        {
          id: 21,
          nombre: 'Pozo Perforado 3',
          imagenPrincipal: '/fotos/pozo3.png',
          duracion: '5 meses',
          estado: 'EN_PROCESO',
        },
      ]

      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(proyectosMock)

      await renderComponent()

      const img = container.querySelector(
        'img[src="/fotos/pozo3.png"]',
      ) as HTMLImageElement
      expect(img).not.toBeNull()
      expect(img.alt).toBe('Fotografía del proyecto Pozo Perforado 3')
      expect(container.querySelector('.projects-preview__card-placeholder')).toBeNull()
    })

    it('Imagen: renderiza placeholder SVG cuando imagenPrincipal es null o undefined', async () => {
      const proyectosMock: proyectosApi.PublicProyecto[] = [
        {
          id: 22,
          nombre: 'Proyecto Sin Imagen',
          imagenPrincipal: null,
          duracion: '1 mes',
          estado: 'PENDIENTE',
        },
      ]

      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(proyectosMock)

      await renderComponent()

      const placeholder = container.querySelector('.projects-preview__card-placeholder')
      expect(placeholder).not.toBeNull()
      expect(placeholder?.querySelector('svg')).not.toBeNull()
      expect(container.querySelector('img')).toBeNull()
    })

    it('Duración: muestra la duración especificada o fallback "—" si es nula', async () => {
      const proyectosMock: proyectosApi.PublicProyecto[] = [
        {
          id: 30,
          nombre: 'Proyecto Con Duración',
          duracion: '8 meses',
          estado: 'COMPLETADO',
        },
        {
          id: 31,
          nombre: 'Proyecto Sin Duración',
          duracion: null,
          estado: 'PENDIENTE',
        },
      ]

      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(proyectosMock)

      await renderComponent()

      const durations = container.querySelectorAll('.projects-preview__duration')
      expect(durations[0].textContent).toContain('Duración: 8 meses')
      expect(durations[1].textContent).toContain('Duración: —')
    })

    it('Estado: badge sobre la imagen con color por estado (sin fila inferior)', async () => {
      const proyectosMock: proyectosApi.PublicProyecto[] = [
        { id: 41, nombre: 'P1', duracion: '1m', estado: 'PENDIENTE' },
        { id: 42, nombre: 'P2', duracion: '2m', estado: 'EN_PROCESO' },
        { id: 43, nombre: 'P3', duracion: '3m', estado: 'COMPLETADO' },
      ]

      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(proyectosMock)

      await renderComponent()

      const badges = container.querySelectorAll('.projects-preview__badge')
      expect(badges[0].textContent).toContain('Pendiente')
      expect(badges[0].className).toContain('bg-sigasj-primary')
      expect(badges[1].textContent).toContain('En proceso')
      expect(badges[1].className).toContain('bg-[#f5d000]')
      expect(badges[2].textContent).toContain('Completado')
      expect(badges[2].className).toContain('bg-sigasj-success')

      expect(container.querySelectorAll('.projects-preview__state-text')).toHaveLength(0)
    })

    it('Ver más: botón/enlace contiene href hacia /proyectos/:id y aria-label accesible', async () => {
      const proyectosMock: proyectosApi.PublicProyecto[] = [
        {
          id: 55,
          nombre: 'Tanque Quebrada Honda',
          duracion: '7 meses',
          estado: 'EN_PROCESO',
        },
      ]

      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(proyectosMock)

      await renderComponent()

      const moreLink = container.querySelector(
        '.projects-preview__more-btn',
      ) as HTMLAnchorElement
      expect(moreLink).not.toBeNull()
      expect(moreLink.textContent).toContain('Ver más')
      expect(moreLink.getAttribute('href')).toBe('/proyectos/55')
      expect(moreLink.getAttribute('aria-label')).toBe(
        'Ver más información sobre Tanque Quebrada Honda',
      )
    })
  })

  describe('Coverflow (≥4): flechas, puntos e infinito', () => {
    const cincoProyectos: proyectosApi.PublicProyecto[] = [
      { id: 1, nombre: 'P1', duracion: '1m', estado: 'EN_PROCESO' },
      { id: 2, nombre: 'P2', duracion: '2m', estado: 'EN_PROCESO' },
      { id: 3, nombre: 'P3', duracion: '3m', estado: 'EN_PROCESO' },
      { id: 4, nombre: 'P4', duracion: '4m', estado: 'COMPLETADO' },
      { id: 5, nombre: 'P5', duracion: '5m', estado: 'PENDIENTE' },
    ]

    it('activa coverflow con 4+ proyectos y no usa grilla', async () => {
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(cincoProyectos)

      await renderComponent()

      expect(container.querySelector('[data-ui="projects-preview__carousel"]')).not.toBeNull()
      expect(container.querySelector('[data-ui="projects-preview__grid"]')).toBeNull()
      expect(container.querySelector('.transparency-coverflow')).not.toBeNull()
    })

    it('Flecha izquierda y derecha: navegación cíclica sin disabled', async () => {
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(cincoProyectos)

      await renderComponent()

      const prevBtn = container.querySelector(
        '[aria-label="Proyecto anterior"]',
      ) as HTMLButtonElement
      const nextBtn = container.querySelector(
        '[aria-label="Siguiente proyecto"]',
      ) as HTMLButtonElement

      expect(prevBtn).not.toBeNull()
      expect(nextBtn).not.toBeNull()
      expect(prevBtn.disabled).toBe(false)
      expect(nextBtn.disabled).toBe(false)
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent?.trim()).toBe(
        '1 / 5',
      )

      await act(async () => {
        nextBtn.click()
      })
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent?.trim()).toBe(
        '2 / 5',
      )

      await act(async () => {
        prevBtn.click()
      })
      await act(async () => {
        prevBtn.click()
      })
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent?.trim()).toBe(
        '5 / 5',
      )
    })

    it('Puntos indicadores: un punto por proyecto y salto directo', async () => {
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(cincoProyectos)

      await renderComponent()

      const dots = container.querySelectorAll('.projects-preview__dot')
      expect(dots.length).toBe(5)
      expect(dots[0].getAttribute('aria-current')).toBe('true')

      await act(async () => {
        ;(dots[2] as HTMLButtonElement).click()
      })

      expect(dots[2].getAttribute('aria-current')).toBe('true')
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent?.trim()).toBe(
        '3 / 5',
      )
    })
  })

  describe('Interacción por Touch y Teclado (coverflow)', () => {
    const cuatroProyectos: proyectosApi.PublicProyecto[] = [
      { id: 1, nombre: 'P1', duracion: '1m', estado: 'EN_PROCESO' },
      { id: 2, nombre: 'P2', duracion: '2m', estado: 'EN_PROCESO' },
      { id: 3, nombre: 'P3', duracion: '3m', estado: 'EN_PROCESO' },
      { id: 4, nombre: 'P4', duracion: '4m', estado: 'COMPLETADO' },
    ]

    it('Teclado: ArrowRight avanza y ArrowLeft retrocede en el viewport accesible', async () => {
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(cuatroProyectos)

      await renderComponent()

      const viewport = container.querySelector(
        '.projects-preview__viewport',
      ) as HTMLDivElement
      expect(viewport).not.toBeNull()
      expect(viewport.getAttribute('role')).toBe('region')
      expect(viewport.getAttribute('tabIndex')).toBe('0')

      await act(async () => {
        viewport.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
        )
      })
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent?.trim()).toBe(
        '2 / 4',
      )

      await act(async () => {
        viewport.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
        )
      })
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent?.trim()).toBe(
        '1 / 4',
      )
    })

    it('Touch: swipe a la izquierda avanza y swipe a la derecha retrocede', async () => {
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(cuatroProyectos)

      await renderComponent()

      const viewport = container.querySelector(
        '.projects-preview__viewport',
      ) as HTMLDivElement

      await act(async () => {
        triggerTouchEvent(viewport, 'touchstart', [{ clientX: 200, clientY: 50 }])
        triggerTouchEvent(viewport, 'touchmove', [{ clientX: 100, clientY: 50 }])
        triggerTouchEvent(viewport, 'touchend')
      })

      expect(container.querySelector('.projects-preview__page-indicator')?.textContent?.trim()).toBe(
        '2 / 4',
      )

      await act(async () => {
        triggerTouchEvent(viewport, 'touchstart', [{ clientX: 100, clientY: 50 }])
        triggerTouchEvent(viewport, 'touchmove', [{ clientX: 200, clientY: 50 }])
        triggerTouchEvent(viewport, 'touchend')
      })

      expect(container.querySelector('.projects-preview__page-indicator')?.textContent?.trim()).toBe(
        '1 / 4',
      )
    })

    it('Touch: ignora movimientos verticales o swipes menores al umbral de 30px', async () => {
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(cuatroProyectos)

      await renderComponent()

      const viewport = container.querySelector(
        '.projects-preview__viewport',
      ) as HTMLDivElement

      await act(async () => {
        triggerTouchEvent(viewport, 'touchstart', [{ clientX: 100, clientY: 200 }])
        triggerTouchEvent(viewport, 'touchmove', [{ clientX: 105, clientY: 100 }])
        triggerTouchEvent(viewport, 'touchend')
      })

      expect(container.querySelector('.projects-preview__page-indicator')?.textContent?.trim()).toBe(
        '1 / 4',
      )

      await act(async () => {
        triggerTouchEvent(viewport, 'touchstart', [{ clientX: 100, clientY: 50 }])
        triggerTouchEvent(viewport, 'touchmove', [{ clientX: 85, clientY: 50 }])
        triggerTouchEvent(viewport, 'touchend')
      })

      expect(container.querySelector('.projects-preview__page-indicator')?.textContent?.trim()).toBe(
        '1 / 4',
      )
    })
  })

  describe('Umbral grilla vs coverflow', () => {
    it('con 3 proyectos usa grilla estática sin controles de carrusel', async () => {
      const tres: proyectosApi.PublicProyecto[] = [
        { id: 1, nombre: 'P1', duracion: '1m', estado: 'EN_PROCESO' },
        { id: 2, nombre: 'P2', duracion: '2m', estado: 'EN_PROCESO' },
        { id: 3, nombre: 'P3', duracion: '3m', estado: 'EN_PROCESO' },
      ]
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(tres)

      await renderComponent()

      expect(container.querySelector('[data-ui="projects-preview__grid"]')).not.toBeNull()
      expect(container.querySelector('[aria-label="Proyecto anterior"]')).toBeNull()
      expect(container.querySelector('.projects-preview__page-indicator')).toBeNull()
    })

    it('con 4 proyectos activa coverflow', async () => {
      const cuatro: proyectosApi.PublicProyecto[] = [
        { id: 1, nombre: 'P1', duracion: '1m', estado: 'EN_PROCESO' },
        { id: 2, nombre: 'P2', duracion: '2m', estado: 'EN_PROCESO' },
        { id: 3, nombre: 'P3', duracion: '3m', estado: 'EN_PROCESO' },
        { id: 4, nombre: 'P4', duracion: '4m', estado: 'COMPLETADO' },
      ]
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(cuatro)

      await renderComponent()

      expect(container.querySelector('[data-ui="projects-preview__carousel"]')).not.toBeNull()
      expect(container.querySelector('[aria-label="Proyecto anterior"]')).not.toBeNull()
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent?.trim()).toBe(
        '1 / 4',
      )
    })
  })
})
