import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import ProyectosAdminTable from './ProyectosAdminTable'
import type { AdminProyecto } from './types'

const proyecto = (overrides: Partial<AdminProyecto>): AdminProyecto => ({
  id: 1,
  nombre: 'Ampliación de Acueducto Norte',
  descripcion: 'No debe verse en el listado',
  encargadoRealizacion: 'Ingeniería',
  duracion: '8 meses',
  estado: 'EN_PROCESO',
  imagenPrincipal: '/media/proyecto.jpg',
  activo: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  ...overrides,
})

describe('ProyectosAdminTable', () => {
  it('muestra las columnas administrativas y los datos reales del Backend', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <ProyectosAdminTable
          proyectos={[
            proyecto({ id: 12, nombre: 'Red de agua potable' }),
            proyecto({
              id: 15,
              nombre: 'Tanque de almacenamiento',
              estado: 'PENDIENTE',
              duracion: null,
              activo: false,
            }),
          ]}
        />
      </MemoryRouter>,
    )

    expect(markup).toContain('table-responsive')
    expect(markup).toContain('proyectos-admin__table')
    expect(markup).toContain('>Proyecto</th>')
    expect(markup).toContain('>Estado</th>')
    expect(markup).toContain('>Duración</th>')
    expect(markup).toContain('>Visibilidad</th>')
    expect(markup).toContain('>Acciones</th>')
    expect(markup).toContain('Red de agua potable')
    expect(markup).toContain('Tanque de almacenamiento')
    expect(markup).toContain('En proceso')
    expect(markup).toContain('Pendiente')
    expect(markup).toContain('8 meses')
    expect(markup).toContain('Activo')
    expect(markup).toContain('Inactivo')
    expect(markup).toContain('Editar')
    expect(markup).toContain('Gestionar imágenes')
    expect(markup).toContain('Inactivar')
    expect(markup).toContain('Activar')
    expect(markup).toContain('aria-label="Ver Red de agua potable"')
    expect(markup).toContain('aria-label="Editar Red de agua potable"')

    expect(markup).toContain('href="/admin/proyectos/12/editar"')
    expect(markup).toContain('href="/admin/proyectos/15/editar"')
    expect(markup).toContain('aria-label="Gestionar imágenes de Red de agua potable"')

    expect(markup).not.toMatch(/href="\/admin\/proyectos\/12"(?!\/)/)
    expect(markup).not.toContain('/imagenes')
    expect(markup).toContain('>En proceso</option>')
    expect(markup).toContain('>Pendiente</option>')
    expect(markup).not.toContain('>EN_PROCESO<')
    expect(markup).not.toContain('>PENDIENTE<')
    expect(markup).not.toContain('No debe verse en el listado')
    expect(markup).not.toContain('Ingeniería')
    expect(markup).not.toContain('meses meses')
  })
})
