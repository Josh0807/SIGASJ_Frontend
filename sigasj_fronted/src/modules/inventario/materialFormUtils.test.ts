import { describe, expect, it } from 'vitest'
import { materialApiError, validateMaterial } from './materialFormUtils'
import type { MaterialFormValues } from './types'

const valid: MaterialFormValues = {
  nombre: 'Tubo PVC',
  descripcion: '',
  unidadMedida: 'Unidad',
  ubicacion: '',
  stockMinimo: '0',
  activo: true,
  categoriaId: '2',
  proveedorId: '10',
  precioUnitario: '',
  fechaVencimiento: '',
  cantidadInicial: '',
  requiereFechaVencimiento: false,
}

function hoyEnCostaRica(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Costa_Rica',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function sumarDias(iso: string, dias: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + dias))
  return date.toISOString().slice(0, 10)
}

describe('validación del formulario de materiales', () => {
  it('acepta datos válidos con categoría y proveedor', () =>
    expect(validateMaterial(valid)).toEqual({}))

  it('exige categoría y proveedor', () => {
    expect(
      validateMaterial({ ...valid, categoriaId: '', proveedorId: '' }),
    ).toEqual({
      categoriaId: 'La categoría es obligatoria.',
      proveedorId: 'El proveedor es obligatorio.',
    })
  })

  it('rechaza obligatorios vacíos y stock negativo', () =>
    expect(
      validateMaterial({
        ...valid,
        nombre: ' ',
        unidadMedida: '',
        stockMinimo: '-1',
      }),
    ).toEqual({
      nombre: 'El nombre es obligatorio.',
      unidadMedida: 'La unidad de medida es obligatoria.',
      stockMinimo: 'Ingrese un número entero mayor o igual a cero.',
    }))

  it('rechaza stock decimal e identificadores inválidos', () => {
    expect(validateMaterial({ ...valid, stockMinimo: '1.5' }).stockMinimo).toBeTruthy()
    expect(validateMaterial({ ...valid, categoriaId: '-2' }).categoriaId).toContain(
      'válida',
    )
    expect(validateMaterial({ ...valid, proveedorId: '-2' }).proveedorId).toContain(
      'válido',
    )
  })

  it('exige una fecha futura cuando el material requiere vencimiento', () => {
    const hoy = hoyEnCostaRica()
    expect(
      validateMaterial({ ...valid, requiereFechaVencimiento: true, fechaVencimiento: '' }).fechaVencimiento,
    ).toContain('obligatoria')
    expect(
      validateMaterial({ ...valid, requiereFechaVencimiento: true, fechaVencimiento: hoy }).fechaVencimiento,
    ).toContain('futura')
    expect(
      validateMaterial({
        ...valid,
        requiereFechaVencimiento: true,
        fechaVencimiento: sumarDias(hoy, 1),
      }).fechaVencimiento,
    ).toBeUndefined()
  })

  it('no exige vencimiento futuro en materiales que no lo requieren', () => {
    expect(
      validateMaterial({ ...valid, requiereFechaVencimiento: false, fechaVencimiento: '2020-01-01' }),
    ).toEqual({})
  })

  it('traduce conflictos y permisos a mensajes comprensibles', () => {
    expect(materialApiError(new Error('HTTP 409: Ya existe el material'))).toContain(
      'Ya existe',
    )
    expect(materialApiError(new Error('HTTP 403: Forbidden'))).toContain('permisos')
  })
})
