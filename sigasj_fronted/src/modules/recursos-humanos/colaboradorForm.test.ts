import { describe, expect, it } from 'vitest'
import {
  EMPTY_COLABORADOR_VALUES,
  colaboradorErrorMessage,
  esCedulaValida,
  formatearFechaAuditoria,
  toColaboradorPayload,
  validateColaborador,
} from './colaboradorForm'

const valid = {
  nombre: ' Juan ',
  apellidos: 'Pérez',
  cedula: '1-1111-1111',
  correoElectronico: ' Juan@Example.com ',
  puestoId: '3',
  usuarioId: '',
  fechaIngreso: '2020-03-15',
  jornadaLaboral: 'COMPLETA' as const,
  diasLaboralesHabituales: '5',
  modalidadPago: 'MENSUAL' as const,
}

describe('formulario de colaborador', () => {
  it('exige todos los campos obligatorios', () => {
    expect(Object.keys(validateColaborador(EMPTY_COLABORADOR_VALUES)).sort()).toEqual(
      [
        'apellidos',
        'cedula',
        'correoElectronico',
        'diasLaboralesHabituales',
        'fechaIngreso',
        'jornadaLaboral',
        'modalidadPago',
        'nombre',
        'puestoId',
      ].sort(),
    )
  })

  it('acepta cédula nacional y DIMEX, y rechaza otros formatos', () => {
    expect(esCedulaValida('1-1111-1111')).toBe(true)
    expect(esCedulaValida('111111111')).toBe(true)
    expect(esCedulaValida('123456789012')).toBe(true)
    expect(esCedulaValida('0-1111-1111')).toBe(false)
    expect(validateColaborador({ ...valid, cedula: 'abc' }).cedula).toMatch(/formato/)
  })

  it('valida correo y puesto', () => {
    expect(validateColaborador({ ...valid, correoElectronico: 'juan' }).correoElectronico).toMatch(/válido/)
    expect(validateColaborador({ ...valid, puestoId: '' }).puestoId).toMatch(/puesto/i)
    expect(validateColaborador(valid)).toEqual({})
  })

  it('normaliza el payload con puestoId', () => {
    expect(toColaboradorPayload(valid, 'crear')).toEqual({
      nombre: 'Juan',
      apellidos: 'Pérez',
      cedula: '1-1111-1111',
      correoElectronico: 'juan@example.com',
      puestoId: 3,
      fechaIngreso: '2020-03-15',
      jornadaLaboral: 'COMPLETA',
      diasLaboralesHabituales: 5,
      modalidadPago: 'MENSUAL',
    })
    expect(toColaboradorPayload(valid, 'editar').usuarioId).toBeNull()
    expect(toColaboradorPayload({ ...valid, usuarioId: '7' }, 'crear').usuarioId).toBe(7)
  })

  it('valida fecha de ingreso futura y días laborales', () => {
    expect(
      validateColaborador({ ...valid, fechaIngreso: '2099-01-01' }).fechaIngreso,
    ).toMatch(/futura/i)
    expect(
      validateColaborador({ ...valid, diasLaboralesHabituales: '8' })
        .diasLaboralesHabituales,
    ).toMatch(/1 y 7/)
    expect(
      validateColaborador({
        ...valid,
        fechaIngreso: '2020-03-15',
        jornadaLaboral: 'COMPLETA',
        diasLaboralesHabituales: '5',
        modalidadPago: 'MENSUAL',
      }),
    ).toEqual({})
  })

  it('incluye expediente laboral en el payload', () => {
    expect(
      toColaboradorPayload(
        {
          ...valid,
          fechaIngreso: '2020-03-15',
          jornadaLaboral: 'COMPLETA',
          diasLaboralesHabituales: '5',
          modalidadPago: 'MENSUAL',
        },
        'crear',
      ),
    ).toMatchObject({
      fechaIngreso: '2020-03-15',
      jornadaLaboral: 'COMPLETA',
      diasLaboralesHabituales: 5,
      modalidadPago: 'MENSUAL',
    })
    expect(
      toColaboradorPayload(
        {
          ...valid,
          fechaIngreso: '',
          jornadaLaboral: '',
          diasLaboralesHabituales: '',
          modalidadPago: '',
        },
        'editar',
      ),
    ).toMatchObject({
      fechaIngreso: null,
      jornadaLaboral: null,
      diasLaboralesHabituales: null,
      modalidadPago: null,
    })
  })

  it('muestra las fechas de auditoría en hora de Costa Rica (UTC-6)', () => {
    const texto = formatearFechaAuditoria('2026-10-08T11:49:14.113Z')
    expect(texto).toMatch(/5:49/)
    expect(texto).toMatch(/2026/)
    expect(formatearFechaAuditoria('2026-10-18T02:35:47.000Z')).toMatch(/17 oct/)
  })

  it('traduce errores HTTP', () => {
    expect(colaboradorErrorMessage(new Error('HTTP 403: x'), 'fallback')).toMatch(/permisos/i)
  })
})
