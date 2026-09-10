import { describe, expect, it } from 'vitest'
import { materialApiError, validateMaterial } from './materialFormUtils'
import type { MaterialFormValues } from './types'

const valid: MaterialFormValues = { nombre: 'Tubo PVC', descripcion: '', unidadMedida: 'Unidad', ubicacion: '', stockMinimo: '0', activo: true, categoriaId: '' }

describe('validación del formulario de materiales', () => {
  it('acepta datos válidos y campos opcionales vacíos', () => expect(validateMaterial(valid)).toEqual({}))
  it('rechaza obligatorios vacíos y stock negativo', () => expect(validateMaterial({ ...valid, nombre: ' ', unidadMedida: '', stockMinimo: '-1' })).toEqual({ nombre: 'El nombre es obligatorio.', unidadMedida: 'La unidad de medida es obligatoria.', stockMinimo: 'Ingrese un número entero mayor o igual a cero.' }))
  it('rechaza stock decimal', () => expect(validateMaterial({ ...valid, stockMinimo: '1.5' }).stockMinimo).toBeTruthy())
  it('traduce conflictos y permisos a mensajes comprensibles', () => {
    expect(materialApiError(new Error('HTTP 409: Ya existe el material'))).toContain('Ya existe')
    expect(materialApiError(new Error('HTTP 403: Forbidden'))).toContain('permisos')
  })
})
