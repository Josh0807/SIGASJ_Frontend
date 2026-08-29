import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProyectoImagenesGaleria from './ProyectoImagenesGaleria'
import { type AdminProyectoDetalle } from './types'
import * as proyectosApi from '../services/proyectosApi'

const proyectoMock = (overrides: Partial<AdminProyectoDetalle> = {}): AdminProyectoDetalle => ({
  id: 10,
  nombre: 'Tanque de Agua Central',
  descripcion: 'Descripción del tanque',
  encargadoRealizacion: 'Ing. Carlos',
  duracion: '6 meses',
  estado: 'EN_PROCESO',
  imagenPrincipal: 'https://example.com/cover.jpg',
  activo: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  imagenes: [
    {
      id: 101,
      url: 'https://example.com/photo1.jpg',
      descripcion: 'Foto 1',
      orden: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 102,
      url: 'https://example.com/photo2.jpg',
      descripcion: 'Foto 2',
      orden: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  ...overrides,
})

describe('ProyectoImagenesGaleria', () => {
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

  it('renderiza la imagen principal y las fotos de la galería', async () => {
    const proyecto = proyectoMock()

    await act(async () => {
      root.render(
        <ProyectoImagenesGaleria proyecto={proyecto} onProyectoUpdated={() => {}} />,
      )
    })

    expect(container.textContent).toContain('IMAGEN PRINCIPAL')
    expect(container.textContent).toContain('GALERÍA')
    expect(container.textContent).toContain('Cambiar imagen')
    expect(container.textContent).toContain('Quitar portada')
    expect(container.textContent).toContain('+ Agregar fotografías')
    expect(container.textContent).toContain('Orden #1')
    expect(container.textContent).toContain('Orden #2')

    const imgs = container.querySelectorAll('img')
    expect(imgs.length).toBe(3) // 1 portada + 2 galería
    expect(imgs[0].src).toBe('https://example.com/cover.jpg')
    expect(imgs[1].src).toBe('https://example.com/photo1.jpg')
    expect(imgs[2].src).toBe('https://example.com/photo2.jpg')
  })

  it('renderiza estado vacío cuando no tiene portada ni fotos', async () => {
    const proyecto = proyectoMock({ imagenPrincipal: null, imagenes: [] })

    await act(async () => {
      root.render(
        <ProyectoImagenesGaleria proyecto={proyecto} onProyectoUpdated={() => {}} />,
      )
    })

    expect(container.textContent).toContain('Sin fotografía principal asignada')
    expect(container.textContent).toContain('Asignar imagen')
    expect(container.textContent).toContain('No se han agregado fotografías a la galería')
  })

  it('solicita confirmación y retira la imagen principal al confirmar', async () => {
    const updated = proyectoMock({ imagenPrincipal: null })
    const spy = vi
      .spyOn(proyectosApi, 'removeProyectoImagenPrincipal')
      .mockResolvedValue(updated)
    const onProyectoUpdated = vi.fn()

    await act(async () => {
      root.render(
        <ProyectoImagenesGaleria
          proyecto={proyectoMock()}
          onProyectoUpdated={onProyectoUpdated}
        />,
      )
    })

    const removeCoverBtn = Array.from(
      container.querySelectorAll('button'),
    ).find((btn) => btn.textContent === 'Quitar portada')

    await act(async () => {
      removeCoverBtn?.click()
    })

    // Debe mostrar el modal ConfirmDialog
    expect(container.textContent).toContain('Quitar imagen principal')
    expect(container.textContent).toContain('¿Está seguro de que desea retirar la imagen de portada')

    const confirmBtn = Array.from(
      container.querySelectorAll('button'),
    ).find((btn) => btn.textContent === 'Confirmar retiro')

    await act(async () => {
      confirmBtn?.click()
    })

    expect(spy).toHaveBeenCalledWith(10)
    expect(onProyectoUpdated).toHaveBeenCalledWith(updated)
  })

  it('permite agregar fotografías a la galería', async () => {
    const updated = proyectoMock({
      imagenes: [
        ...proyectoMock().imagenes,
        {
          id: 103,
          url: 'https://example.com/photo3.jpg',
          descripcion: 'Foto 3',
          orden: 3,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    })
    const spy = vi
      .spyOn(proyectosApi, 'uploadProyectoImagenes')
      .mockResolvedValue(updated)
    const onProyectoUpdated = vi.fn()

    await act(async () => {
      root.render(
        <ProyectoImagenesGaleria
          proyecto={proyectoMock()}
          onProyectoUpdated={onProyectoUpdated}
        />,
      )
    })

    const fileInput = container.querySelector(
      '#proyecto-gallery-file-input',
    ) as HTMLInputElement
    const file = new File(['content'], 'test.png', { type: 'image/png' })

    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: true,
      })
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(spy).toHaveBeenCalledWith(10, [file])
    expect(onProyectoUpdated).toHaveBeenCalledWith(updated)
  })

  it('solicita confirmación y retira una fotografía de la galería', async () => {
    const updated = proyectoMock({
      imagenes: [proyectoMock().imagenes[1]],
    })
    const spy = vi
      .spyOn(proyectosApi, 'deleteProyectoImagen')
      .mockResolvedValue(updated)
    const onProyectoUpdated = vi.fn()

    await act(async () => {
      root.render(
        <ProyectoImagenesGaleria
          proyecto={proyectoMock()}
          onProyectoUpdated={onProyectoUpdated}
        />,
      )
    })

    const retirarBtns = Array.from(
      container.querySelectorAll('button'),
    ).filter((btn) => btn.textContent === 'Retirar')

    await act(async () => {
      retirarBtns[0]?.click()
    })

    expect(container.textContent).toContain('Retirar fotografía')
    expect(container.textContent).toContain('¿Está seguro de que desea retirar esta fotografía')

    const confirmBtn = Array.from(
      container.querySelectorAll('button'),
    ).find((btn) => btn.textContent === 'Confirmar retiro')

    await act(async () => {
      confirmBtn?.click()
    })

    expect(spy).toHaveBeenCalledWith(10, 101)
    expect(onProyectoUpdated).toHaveBeenCalledWith(updated)
  })

  it('permite reordenar fotografías de la galería', async () => {
    const updated = proyectoMock({
      imagenes: [
        { ...proyectoMock().imagenes[1], orden: 1 },
        { ...proyectoMock().imagenes[0], orden: 2 },
      ],
    })
    const spy = vi
      .spyOn(proyectosApi, 'reorderProyectoImagenes')
      .mockResolvedValue(updated)
    const onProyectoUpdated = vi.fn()

    await act(async () => {
      root.render(
        <ProyectoImagenesGaleria
          proyecto={proyectoMock()}
          onProyectoUpdated={onProyectoUpdated}
        />,
      )
    })

    const bajarBtn = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent === 'Bajar',
    )

    await act(async () => {
      bajarBtn?.click()
    })

    expect(spy).toHaveBeenCalledWith(10, [
      { id: 102, orden: 1 },
      { id: 101, orden: 2 },
    ])
    expect(onProyectoUpdated).toHaveBeenCalledWith(updated)
  })

  it('muestra error cuando un archivo seleccionado no cumple con las validaciones', async () => {
    await act(async () => {
      root.render(
        <ProyectoImagenesGaleria
          proyecto={proyectoMock()}
          onProyectoUpdated={() => {}} />,
      )
    })

    const fileInput = container.querySelector(
      '#proyecto-cover-file-input',
    ) as HTMLInputElement
    const invalidFile = new File(['content'], 'document.pdf', {
      type: 'application/pdf',
    })

    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: true,
      })
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(container.textContent).toContain('Formato de imagen no permitido')
  })

  it('rechaza archivos que superan los 5 MB', async () => {
    await act(async () => {
      root.render(
        <ProyectoImagenesGaleria
          proyecto={proyectoMock()}
          onProyectoUpdated={() => {}} />,
      )
    })

    const fileInput = container.querySelector(
      '#proyecto-cover-file-input',
    ) as HTMLInputElement
    const largeContent = new ArrayBuffer(6 * 1024 * 1024)
    const largeFile = new File([largeContent], 'heavy.jpg', { type: 'image/jpeg' })

    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        value: [largeFile],
        writable: true,
      })
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(container.textContent).toContain('El archivo supera el tamaño máximo permitido')
  })


  it('permite cambiar la imagen principal por una nueva válida', async () => {
    const updated = proyectoMock({ imagenPrincipal: 'https://example.com/newcover.jpg' })
    const spy = vi
      .spyOn(proyectosApi, 'uploadProyectoImagenPrincipal')
      .mockResolvedValue(updated)
    const onProyectoUpdated = vi.fn()

    await act(async () => {
      root.render(
        <ProyectoImagenesGaleria
          proyecto={proyectoMock()}
          onProyectoUpdated={onProyectoUpdated}
        />,
      )
    })

    const fileInput = container.querySelector(
      '#proyecto-cover-file-input',
    ) as HTMLInputElement
    const file = new File(['content'], 'newcover.jpg', { type: 'image/jpeg' })

    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: true,
      })
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(spy).toHaveBeenCalledWith(10, file)
    expect(onProyectoUpdated).toHaveBeenCalledWith(updated)
  })

  it('permite agregar varias fotografías a la galería a la vez', async () => {
    const updated = proyectoMock({
      imagenes: [
        ...proyectoMock().imagenes,
        { id: 103, url: 'https://example.com/3.jpg', descripcion: 'Foto 3', orden: 3, createdAt: '2026-01-01T00:00:00.000Z' },
        { id: 104, url: 'https://example.com/4.jpg', descripcion: 'Foto 4', orden: 4, createdAt: '2026-01-01T00:00:00.000Z' },
      ],
    })
    const spy = vi
      .spyOn(proyectosApi, 'uploadProyectoImagenes')
      .mockResolvedValue(updated)
    const onProyectoUpdated = vi.fn()

    await act(async () => {
      root.render(
        <ProyectoImagenesGaleria
          proyecto={proyectoMock()}
          onProyectoUpdated={onProyectoUpdated}
        />,
      )
    })

    const fileInput = container.querySelector(
      '#proyecto-gallery-file-input',
    ) as HTMLInputElement
    const f1 = new File(['1'], 'photo1.jpg', { type: 'image/jpeg' })
    const f2 = new File(['2'], 'photo2.jpg', { type: 'image/jpeg' })

    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        value: [f1, f2],
        writable: true,
      })
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(spy).toHaveBeenCalledWith(10, [f1, f2])
    expect(onProyectoUpdated).toHaveBeenCalledWith(updated)
  })

  it('muestra mensaje de error si la API rechaza retirar una fotografía (ej. de otro proyecto o 404/403)', async () => {
    vi.spyOn(proyectosApi, 'deleteProyectoImagen').mockRejectedValueOnce(
      new Error('HTTP 404: La fotografía no pertenece a este proyecto.'),
    )

    await act(async () => {
      root.render(
        <ProyectoImagenesGaleria
          proyecto={proyectoMock()}
          onProyectoUpdated={() => {}}
        />,
      )
    })

    const retirarBtns = Array.from(
      container.querySelectorAll('button'),
    ).filter((btn) => btn.textContent === 'Retirar')

    await act(async () => {
      retirarBtns[0]?.click()
    })

    const confirmBtn = Array.from(
      container.querySelectorAll('button'),
    ).find((btn) => btn.textContent === 'Confirmar retiro')

    await act(async () => {
      confirmBtn?.click()
    })

    expect(container.textContent).toContain('HTTP 404: La fotografía no pertenece a este proyecto.')
  })
})


