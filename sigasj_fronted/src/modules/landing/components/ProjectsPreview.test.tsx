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
    // Viewport por defecto para Desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
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

  const setWindowWidth = async (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    })
    await act(async () => {
      window.dispatchEvent(new Event('resize'))
    })
  }

  const triggerTouchEvent = (
    element: HTMLElement,
    type: 'touchstart' | 'touchmove' | 'touchend',
    touches?: { clientX: number; clientY: number }[],
  ) => {
    const event = new Event(type, { bubbles: true, cancelable: true }) as any
    event.targetTouches = touches || []
    event.touches = touches || []
    event.changedTouches = touches || []
    element.dispatchEvent(event)
  }

  /* --------------------------------------------------------------------------
   * 1. Carga, Error y Vacío
   * -------------------------------------------------------------------------- */
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
      expect(container.textContent).toContain('HTTP 500: Error en el servidor')

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

  /* --------------------------------------------------------------------------
   * 2. Proyecto activo y Proyecto inactivo
   * -------------------------------------------------------------------------- */
  describe('Proyecto activo e inactivo', () => {
    it('Proyecto activo: renderiza en el carrusel los proyectos activos retornados por la API pública', async () => {
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
    })

    it('Proyecto inactivo: cuando el backend no retorna proyectos inactivos en el endpoint público, la interfaz no los renderiza', async () => {
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce([])

      await renderComponent()

      expect(container.querySelector('.projects-preview__card')).toBeNull()
      expect(container.textContent).toContain('Actualmente no hay proyectos disponibles.')
    })
  })

  /* --------------------------------------------------------------------------
   * 3. Card, Nombre, Imagen, Duración, Estado, Ver más
   * -------------------------------------------------------------------------- */
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

    it('Estado: muestra etiquetas legibles para PENDIENTE, EN_PROCESO y COMPLETADO', async () => {
      const proyectosMock: proyectosApi.PublicProyecto[] = [
        { id: 41, nombre: 'P1', duracion: '1m', estado: 'PENDIENTE' },
        { id: 42, nombre: 'P2', duracion: '2m', estado: 'EN_PROCESO' },
        { id: 43, nombre: 'P3', duracion: '3m', estado: 'COMPLETADO' },
      ]

      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(proyectosMock)

      await renderComponent()

      const badges = container.querySelectorAll('.projects-preview__badge')
      expect(badges[0].textContent).toBe('Pendiente')
      expect(badges[1].textContent).toBe('En proceso')
      expect(badges[2].textContent).toBe('Completado')

      const stateTexts = container.querySelectorAll('.projects-preview__state-text')
      expect(stateTexts[0].textContent).toContain('Estado: Pendiente')
      expect(stateTexts[1].textContent).toContain('Estado: En proceso')
      expect(stateTexts[2].textContent).toContain('Estado: Completado')
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
      expect(moreLink.textContent).toBe('Ver más')
      expect(moreLink.getAttribute('href')).toBe('/proyectos/55')
      expect(moreLink.getAttribute('aria-label')).toBe(
        'Ver más información sobre Tanque Quebrada Honda',
      )
    })
  })

  /* --------------------------------------------------------------------------
   * 4. Controles: Flecha izquierda, Flecha derecha y Puntos
   * -------------------------------------------------------------------------- */
  describe('Controles de carrusel (Flecha izquierda, Flecha derecha)', () => {
    const cincoProyectos: proyectosApi.PublicProyecto[] = [
      { id: 1, nombre: 'P1', duracion: '1m', estado: 'EN_PROCESO' },
      { id: 2, nombre: 'P2', duracion: '2m', estado: 'EN_PROCESO' },
      { id: 3, nombre: 'P3', duracion: '3m', estado: 'EN_PROCESO' },
      { id: 4, nombre: 'P4', duracion: '4m', estado: 'COMPLETADO' },
      { id: 5, nombre: 'P5', duracion: '5m', estado: 'PENDIENTE' },
    ]

    it('Flecha izquierda y Flecha derecha: navegación secuencial y control de estado disabled', async () => {
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
      expect(prevBtn.textContent?.trim()).toBe('‹')
      expect(nextBtn.textContent?.trim()).toBe('›')

      // Inicialmente en página 1: prev deshabilitado, next habilitado
      expect(prevBtn.disabled).toBe(true)
      expect(nextBtn.disabled).toBe(false)
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
        '1 / 3',
      )

      // Clic en Flecha derecha (avanza a página 2)
      await act(async () => {
        nextBtn.click()
      })
      expect(prevBtn.disabled).toBe(false)
      expect(nextBtn.disabled).toBe(false)
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
        '2 / 3',
      )

      // Clic en Flecha derecha (avanza a página 3 - final)
      await act(async () => {
        nextBtn.click()
      })
      expect(prevBtn.disabled).toBe(false)
      expect(nextBtn.disabled).toBe(true)
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
        '3 / 3',
      )

      // Clic en Flecha izquierda (retrocede a página 2)
      await act(async () => {
        prevBtn.click()
      })
      expect(prevBtn.disabled).toBe(false)
      expect(nextBtn.disabled).toBe(false)
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
        '2 / 3',
      )
    })

    it('Puntos indicadores: navegación directa al hacer clic en un punto', async () => {
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(cincoProyectos)

      await renderComponent()

      const dots = container.querySelectorAll('.projects-preview__dot')
      expect(dots.length).toBe(3)
      expect(dots[0].classList.contains('is-active')).toBe(true)

      await act(async () => {
        ;(dots[2] as HTMLButtonElement).click()
      })

      expect(dots[2].classList.contains('is-active')).toBe(true)
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
        '3 / 3',
      )
    })
  })

  /* --------------------------------------------------------------------------
   * 5. Navegación por Touch y Teclado
   * -------------------------------------------------------------------------- */
  describe('Interacción por Touch y Teclado', () => {
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

      // Presionar ArrowRight
      await act(async () => {
        viewport.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
        )
      })
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
        '2 / 2',
      )

      // Presionar ArrowLeft
      await act(async () => {
        viewport.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
        )
      })
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
        '1 / 2',
      )

      // Otra tecla no causa cambios
      await act(async () => {
        viewport.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Space', bubbles: true }),
        )
      })
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
        '1 / 2',
      )
    })

    it('Touch: swipe a la izquierda avanza y swipe a la derecha retrocede', async () => {
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(cuatroProyectos)

      await renderComponent()

      const viewport = container.querySelector(
        '.projects-preview__viewport',
      ) as HTMLDivElement

      // Swipe hacia la izquierda: start X=200, move X=100 (diffX = 100 > 30) -> Next
      await act(async () => {
        triggerTouchEvent(viewport, 'touchstart', [{ clientX: 200, clientY: 50 }])
        triggerTouchEvent(viewport, 'touchmove', [{ clientX: 100, clientY: 50 }])
        triggerTouchEvent(viewport, 'touchend')
      })

      expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
        '2 / 2',
      )

      // Swipe hacia la derecha: start X=100, move X=200 (diffX = -100 < -30) -> Prev
      await act(async () => {
        triggerTouchEvent(viewport, 'touchstart', [{ clientX: 100, clientY: 50 }])
        triggerTouchEvent(viewport, 'touchmove', [{ clientX: 200, clientY: 50 }])
        triggerTouchEvent(viewport, 'touchend')
      })

      expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
        '1 / 2',
      )
    })

    it('Touch: ignora movimientos verticales o swipes menores al umbral de 30px', async () => {
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(cuatroProyectos)

      await renderComponent()

      const viewport = container.querySelector(
        '.projects-preview__viewport',
      ) as HTMLDivElement

      // Desplazamiento vertical (scroll del usuario)
      await act(async () => {
        triggerTouchEvent(viewport, 'touchstart', [{ clientX: 100, clientY: 200 }])
        triggerTouchEvent(viewport, 'touchmove', [{ clientX: 105, clientY: 100 }])
        triggerTouchEvent(viewport, 'touchend')
      })

      // No avanza
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
        '1 / 2',
      )

      // Desplazamiento muy corto (<30px)
      await act(async () => {
        triggerTouchEvent(viewport, 'touchstart', [{ clientX: 100, clientY: 50 }])
        triggerTouchEvent(viewport, 'touchmove', [{ clientX: 85, clientY: 50 }])
        triggerTouchEvent(viewport, 'touchend')
      })

      // No avanza
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
        '1 / 2',
      )
    })
  })

  /* --------------------------------------------------------------------------
   * 6. Responsividad: Desktop, Tablet, Celular
   * -------------------------------------------------------------------------- */
  describe('Responsividad (Desktop, Tablet, Celular)', () => {
    const proyectosMock: proyectosApi.PublicProyecto[] = [
      { id: 1, nombre: 'P1', duracion: '1m', estado: 'EN_PROCESO' },
      { id: 2, nombre: 'P2', duracion: '2m', estado: 'EN_PROCESO' },
      { id: 3, nombre: 'P3', duracion: '3m', estado: 'EN_PROCESO' },
      { id: 4, nombre: 'P4', duracion: '4m', estado: 'COMPLETADO' },
    ]

    it('Desktop (>= 1024px): muestra 3 tarjetas por vista con slidesPerView = 3', async () => {
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(proyectosMock)

      await setWindowWidth(1280)
      await renderComponent()

      const slides = container.querySelectorAll('.projects-preview__slide')
      expect(slides.length).toBe(4)
      expect((slides[0] as HTMLElement).style.flex).toBe('0 0 33.333333333333336%')

      // Con 4 proyectos y 3 por vista, hay 2 posiciones (4 - 3 + 1 = 2)
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
        '1 / 2',
      )
    })

    it('Tablet (640px a 1023px): muestra 2 tarjetas por vista con slidesPerView = 2', async () => {
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(proyectosMock)

      await setWindowWidth(768)
      await renderComponent()

      const slides = container.querySelectorAll('.projects-preview__slide')
      expect(slides.length).toBe(4)
      expect((slides[0] as HTMLElement).style.flex).toBe('0 0 50%')

      // Con 4 proyectos y 2 por vista, hay 3 posiciones (4 - 2 + 1 = 3)
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
        '1 / 3',
      )
    })

    it('Celular (< 640px): muestra 1 tarjeta por vista con slidesPerView = 1', async () => {
      vi.spyOn(proyectosApi, 'getPublicProyectos').mockResolvedValueOnce(proyectosMock)

      await setWindowWidth(375)
      await renderComponent()

      const slides = container.querySelectorAll('.projects-preview__slide')
      expect(slides.length).toBe(4)
      expect((slides[0] as HTMLElement).style.flex).toBe('0 0 100%')

      // Con 4 proyectos y 1 por vista, hay 4 posiciones (4 - 1 + 1 = 4)
      expect(container.querySelector('.projects-preview__page-indicator')?.textContent).toBe(
        '1 / 4',
      )
    })
  })
})





