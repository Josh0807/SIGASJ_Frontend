import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProyectoPublicDetailPage from './ProyectoPublicDetailPage'
import * as proyectosApi from '../services/proyectosApi'

describe('ProyectoPublicDetailPage', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.restoreAllMocks()
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  const renderDetailPage = async (projectId = '10') => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[`/proyectos/${projectId}`]}>
          <Routes>
            <Route path="/proyectos/:id" element={<ProyectoPublicDetailPage />} />
          </Routes>
        </MemoryRouter>,
      )
    })

    await act(async () => {
      await Promise.resolve()
    })
  }

  it('muestra el estado de carga mientras consulta el detalle del proyecto', async () => {
    vi.spyOn(proyectosApi, 'getPublicProyectoDetalle').mockReturnValue(
      new Promise(() => undefined),
    )

    await renderDetailPage('10')

    expect(container.textContent).toContain('Cargando información del proyecto…')
  })

  it('renderiza la información completa del proyecto activo con imagen, metadata y galería', async () => {
    const detalleMock: proyectosApi.PublicProyectoDetalle = {
      id: 10,
      nombre: 'Ampliación de Red Hídrica Sector Sur',
      descripcion: 'Instalación de 4000 metros de tubería de alta densidad.',
      encargadoRealizacion: 'Ing. Carlos Mendoza',
      duracion: '8 meses',
      estado: 'EN_PROCESO',
      imagenPrincipal: '/media/portada.jpg',
      activo: true,
      imagenes: [
        { id: 101, imagenUrl: '/media/foto1.jpg', textoAlternativo: 'Excavación' },
        { id: 102, imagenUrl: '/media/foto2.jpg', textoAlternativo: 'Tuberías' },
      ],
    }

    vi.spyOn(proyectosApi, 'getPublicProyectoDetalle').mockResolvedValueOnce(
      detalleMock,
    )

    await renderDetailPage('10')

    expect(container.textContent).toContain('Ampliación de Red Hídrica Sector Sur')
    expect(container.textContent).toContain('Instalación de 4000 metros de tubería')
    expect(container.textContent).toContain('Ing. Carlos Mendoza')
    expect(container.textContent).toContain('8 meses')
    expect(container.textContent).toContain('En proceso')

    const coverImg = container.querySelector('img[src="/media/portada.jpg"]')
    expect(coverImg).not.toBeNull()

    const galleryGrid = container.querySelectorAll('.proyecto-detail-public__gallery-item')
    expect(galleryGrid.length).toBe(2)
  })

  it('muestra mensaje de proyecto no disponible si el ID no existe o está inactivo', async () => {
    vi.spyOn(proyectosApi, 'getPublicProyectoDetalle').mockRejectedValueOnce(
      new Error('HTTP 404: Proyecto no existe o inactivo'),
    )

    await renderDetailPage('999')

    expect(container.textContent).toContain('Proyecto no disponible')
    expect(container.textContent).toContain('El proyecto solicitado no existe o no se encuentra publicado actualmente.')
  })

  it('trata un proyecto despublicado (activo: false o HTTP 403) como no disponible', async () => {
    vi.spyOn(proyectosApi, 'getPublicProyectoDetalle').mockResolvedValueOnce({
      id: 10,
      nombre: 'Proyecto Oculto',
      estado: 'COMPLETADO',
      activo: false,
    })

    await renderDetailPage('10')

    expect(container.textContent).toContain('Proyecto no disponible')
    expect(container.textContent).toContain('El proyecto solicitado no existe o no se encuentra publicado actualmente.')
  })

  it('muestra opción de reintento si ocurre un error inesperado de red', async () => {
    const spy = vi
      .spyOn(proyectosApi, 'getPublicProyectoDetalle')
      .mockRejectedValueOnce(new Error('HTTP 500: Fallo de servidor'))
      .mockResolvedValueOnce({
        id: 10,
        nombre: 'Proyecto Reintentado',
        estado: 'COMPLETADO',
        activo: true,
      })

    await renderDetailPage('10')

    expect(container.textContent).toContain('No fue posible cargar la información del proyecto.')


    const retryBtn = container.querySelector(
      '.proyecto-detail-public__error button',
    ) as HTMLButtonElement

    expect(retryBtn).not.toBeNull()

    await act(async () => {
      retryBtn.click()
    })

    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('permite navegar las fotografías adicionales mediante botones Anterior y Siguiente, teclado y gestos touch', async () => {
    const detalleMock: proyectosApi.PublicProyectoDetalle = {
      id: 10,
      nombre: 'Red Hídrica',
      estado: 'EN_PROCESO',
      activo: true,
      imagenPrincipal: '/portada.jpg',
      imagenes: [
        { id: 1, imagenUrl: '/foto1.jpg', textoAlternativo: 'Excavación inicial' },
        { id: 2, imagenUrl: '/foto2.jpg', textoAlternativo: 'Instalación de tubos' },
        { id: 3, imagenUrl: '/foto3.jpg', textoAlternativo: 'Válvula instalada' },
        { id: 4, imagenUrl: '/foto4.jpg', textoAlternativo: 'Prueba de presión' },
        { id: 5, imagenUrl: '/foto5.jpg', textoAlternativo: 'Relleno de zanja' },
      ],
    }

    vi.spyOn(proyectosApi, 'getPublicProyectoDetalle').mockResolvedValueOnce(detalleMock)

    await renderDetailPage('10')

    // Verificar distinción entre imagen de portada y galería
    const coverImg = container.querySelector('.proyecto-detail-public__cover img') as HTMLImageElement
    expect(coverImg.src).toContain('/portada.jpg')

    const galleryItems = container.querySelectorAll('.proyecto-detail-public__gallery-item')
    expect(galleryItems.length).toBe(5)
    expect(container.textContent).not.toContain('/portada.jpg en galería')

    // Botones de navegación Anterior y Siguiente
    const prevBtn = container.querySelector(
      '.proyecto-detail-public__side-btn--prev',
    ) as HTMLButtonElement
    const nextBtn = container.querySelector(
      '.proyecto-detail-public__side-btn--next',
    ) as HTMLButtonElement

    expect(prevBtn).not.toBeNull()
    expect(nextBtn).not.toBeNull()
    expect(prevBtn.disabled).toBe(true)
    expect(nextBtn.disabled).toBe(false)

    // Clic en Siguiente
    await act(async () => {
      nextBtn.click()
    })
    expect(prevBtn.disabled).toBe(false)

    // Navegación por teclado (ArrowRight y ArrowLeft)
    const viewport = container.querySelector(
      '.proyecto-detail-public__gallery-viewport',
    ) as HTMLDivElement

    expect(viewport).not.toBeNull()

    await act(async () => {
      viewport.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
      )
    })
    expect(prevBtn.disabled).toBe(true)

    // Navegación por gestos Touch (Swipe)
    await act(async () => {
      viewport.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [{ clientX: 200, clientY: 100 } as Touch],
          targetTouches: [{ clientX: 200, clientY: 100 } as Touch],
          changedTouches: [{ clientX: 200, clientY: 100 } as Touch],
          bubbles: true,
        }),
      )
      viewport.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [{ clientX: 50, clientY: 100 } as Touch],
          targetTouches: [{ clientX: 50, clientY: 100 } as Touch],
          changedTouches: [{ clientX: 50, clientY: 100 } as Touch],
          bubbles: true,
        }),
      )
      viewport.dispatchEvent(new TouchEvent('touchend', { bubbles: true }))
    })

    expect(prevBtn.disabled).toBe(false)
  })

  it('no muestra la sección de galería cuando hay 0 imágenes adicionales (evita espacios vacíos)', async () => {
    const detalleMock: proyectosApi.PublicProyectoDetalle = {
      id: 10,
      nombre: 'Proyecto Sin Fotos Adicionales',
      estado: 'COMPLETADO',
      activo: true,
      imagenPrincipal: '/portada.jpg',
      imagenes: [],
    }

    vi.spyOn(proyectosApi, 'getPublicProyectoDetalle').mockResolvedValueOnce(detalleMock)

    await renderDetailPage('10')

    const gallerySection = container.querySelector('.proyecto-detail-public__gallery-section')
    expect(gallerySection).toBeNull()
  })

  it('muestra la fotografía sin flechas de navegación cuando hay exactamente 1 imagen adicional', async () => {
    const detalleMock: proyectosApi.PublicProyectoDetalle = {
      id: 10,
      nombre: 'Proyecto Con 1 Foto',
      estado: 'COMPLETADO',
      activo: true,
      imagenPrincipal: '/portada.jpg',
      imagenes: [
        { id: 1, imagenUrl: '/unica_foto.jpg', textoAlternativo: 'Única fotografía' },
      ],
    }

    vi.spyOn(proyectosApi, 'getPublicProyectoDetalle').mockResolvedValueOnce(detalleMock)

    await renderDetailPage('10')

    const gallerySection = container.querySelector('.proyecto-detail-public__gallery-section')
    expect(gallerySection).not.toBeNull()

    const controls = container.querySelector('.proyecto-detail-public__gallery-controls')
    expect(controls).toBeNull()

    const prevBtn = container.querySelector('.proyecto-detail-public__side-btn--prev')
    const nextBtn = container.querySelector('.proyecto-detail-public__side-btn--next')
    expect(prevBtn).toBeNull()
    expect(nextBtn).toBeNull()

    const singleItem = container.querySelector('.proyecto-detail-public__gallery-item--single')
    expect(singleItem).not.toBeNull()
  })
})
