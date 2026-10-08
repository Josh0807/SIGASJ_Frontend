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
  cargo: 'Fontanero',
  usuarioId: '',
}

describe('formulario de colaborador', () => {
  it('exige todos los campos obligatorios', () => {
    expect(Object.keys(validateColaborador(EMPTY_COLABORADOR_VALUES)).sort()).toEqual(
      ['apellidos', 'cargo', 'cedula', 'correoElectronico', 'nombre'].sort(),
    )
  })

  it('acepta cédula nacional y DIMEX, y rechaza otros formatos', () => {
    expect(esCedulaValida('1-1111-1111')).toBe(true)
    expect(esCedulaValida('111111111')).toBe(true)
    expect(esCedulaValida('123456789012')).toBe(true)
    expect(esCedulaValida('0-1111-1111')).toBe(false)
    expect(esCedulaValida('1-11-11')).toBe(false)
    expect(validateColaborador({ ...valid, cedula: 'abc' }).cedula).toMatch(/formato/)
  })

  it('valida correo y longitudes máximas', () => {
    expect(validateColaborador({ ...valid, correoElectronico: 'juan' }).correoElectronico).toMatch(/válido/)
    expect(validateColaborador({ ...valid, cargo: 'x'.repeat(101) }).cargo).toMatch(/100/)
    expect(validateColaborador(valid)).toEqual({})
  })

  it('normaliza el payload y solo desvincula la cuenta al editar', () => {
    expect(toColaboradorPayload(valid, 'crear')).toEqual({
      nombre: 'Juan',
      apellidos: 'Pérez',
      cedula: '1-1111-1111',
      correoElectronico: 'juan@example.com',
      cargo: 'Fontanero',
    })
    expect(toColaboradorPayload(valid, 'editar').usuarioId).toBeNull()
    expect(toColaboradorPayload({ ...valid, usuarioId: '7' }, 'crear').usuarioId).toBe(7)
  })

  it('muestra las fechas de auditoría con la hora guardada en SQL Server', () => {
    const texto = formatearFechaAuditoria('2026-10-08T11:49:14.113Z')
    expect(texto).toMatch(/11:49/)
    expect(texto).toMatch(/2026/)
    expect(formatearFechaAuditoria('no-es-fecha')).toBe('—')
  })

  it('traduce los errores HTTP del backend', () => {
    expect(colaboradorErrorMessage(new Error('HTTP 409: Ya existe un colaborador con esa cédula'), 'x')).toBe(
      'Ya existe un colaborador con esa cédula',
    )
    expect(colaboradorErrorMessage(new Error('HTTP 400: ["cedula inválida"]'), 'x')).toBe('cedula inválida.')
    expect(colaboradorErrorMessage(new Error('HTTP 403: Forbidden'), 'x')).toMatch(/permisos/)
    expect(colaboradorErrorMessage(new Error('HTTP 404: Not Found'), 'x')).toMatch(/no existe/)
    expect(colaboradorErrorMessage(new Error('Failed to fetch'), 'x')).toMatch(/conexión/)
    expect(colaboradorErrorMessage(new Error('HTTP 500: boom'), 'fallback')).toBe('fallback')
  })
})
