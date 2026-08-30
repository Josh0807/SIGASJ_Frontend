import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ProyectosAdminDetailView from './ProyectosAdminDetailView'
import type { AdminProyectoDetalle } from './types'

const detalle = (
  overrides: Partial<AdminProyectoDetalle> = {},
): AdminProyectoDetalle => ({
  id: 12,
  nombre: 'Ampliación de Acueducto',
  descripcion: 'Red principal de la ASADA',
  encargadoRealizacion: 'Ing. María Rodríguez',
  duracion: '8 meses',
  estado: 'EN_PROCESO',
  imagenPrincipal: 'https://ejemplo.com/tanque.jpg',
  activo: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-03-15T00:00:00.000Z',
  imagenes: [],
  ...overrides,
})

describe('ProyectosAdminDetailView', () => {
  it('muestra los campos reales del contrato y no propiedades internas', () => {
    const markup = renderToStaticMarkup(
      <ProyectosAdminDetailView
        proyecto={{
          ...detalle(),
          createdBy: 'usuario-ajeno',
          passwordHash: 'secreto',
        } as AdminProyectoDetalle}
      />,
    )

    expect(markup).toContain('Detalle del proyecto')
    expect(markup).toContain('>ID</dt>')
    expect(markup).toContain('>12</dd>')
    expect(markup).toContain('Ampliación de Acueducto')
    expect(markup).toContain('Red principal de la ASADA')
    expect(markup).toContain('Ing. María Rodríguez')
    expect(markup).toContain('8 meses')
    expect(markup).toContain('En proceso')
    expect(markup).not.toContain('EN_PROCESO')
    expect(markup).toContain('https://ejemplo.com/tanque.jpg')
    expect(markup).toContain('Inactivo')
    expect(markup).toContain('01/01/2026')
    expect(markup).toContain('15/03/2026')
    expect(markup).toContain('No hay imágenes en la galería.')
    expect(markup).not.toContain('usuario-ajeno')
    expect(markup).not.toContain('passwordHash')
    expect(markup).not.toContain('secreto')
    expect(markup).not.toContain('createdBy')
  })

  it('muestra la galería con la información disponible y acepta colección vacía', () => {
    const conGaleria = renderToStaticMarkup(
      <ProyectosAdminDetailView
        proyecto={detalle({
          imagenes: [
            {
              id: 2,
              url: 'https://ejemplo.com/propia-2.jpg',
              descripcion: 'Galería propia 2',
              orden: 2,
              createdAt: '2026-02-02T00:00:00.000Z',
            },
            {
              id: 1,
              url: 'https://ejemplo.com/propia-1.jpg',
              descripcion: 'Galería propia 1',
              orden: 1,
              createdAt: '2026-02-01T00:00:00.000Z',
            },
          ],
        })}
      />,
    )

    expect(conGaleria).toContain('Galería propia 1')
    expect(conGaleria).toContain('Galería propia 2')
    expect(conGaleria).toContain('Orden 1')
    expect(conGaleria).toContain('Orden 2')
    expect(conGaleria).toContain('https://ejemplo.com/propia-1.jpg')
    expect(conGaleria.indexOf('propia-1.jpg')).toBeLessThan(
      conGaleria.indexOf('propia-2.jpg'),
    )
    expect(conGaleria).not.toContain('No hay imágenes en la galería.')

    const vacia = renderToStaticMarkup(
      <ProyectosAdminDetailView proyecto={detalle({ imagenes: [] })} />,
    )
    expect(vacia).toContain('No hay imágenes en la galería.')
    expect(vacia).not.toContain('undefined')
  })

  it('usa un marcador cuando los opcionales vienen nulos', () => {
    const markup = renderToStaticMarkup(
      <ProyectosAdminDetailView
        proyecto={detalle({
          descripcion: null,
          encargadoRealizacion: null,
          duracion: null,
          imagenPrincipal: null,
        })}
      />,
    )

    expect(markup).toContain('—')
    expect(markup).not.toContain('null')
    expect(markup).not.toContain('undefined')
  })
})
