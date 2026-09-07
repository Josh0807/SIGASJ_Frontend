import { describe, expect, it } from 'vitest'
import { validateActividadRegistroForm } from '../utils/validateActividadRegistroForm'

describe('validateActividadRegistroForm', () => {
  it('requiere fecha y título', () => {
    const errors = validateActividadRegistroForm({
      fechaActividad: '',
      titulo: '',
      ubicacion: '',
      observaciones: '',
    })

    expect(errors.fechaActividad).toBeDefined()
    expect(errors.titulo).toBeDefined()
  })

  it('valida formato de fecha', () => {
    const errors = validateActividadRegistroForm({
      fechaActividad: '07-09-2026',
      titulo: 'Control sector norte',
      ubicacion: '',
      observaciones: '',
    })

    expect(errors.fechaActividad).toContain('YYYY-MM-DD')
  })

  it('acepta valores válidos', () => {
    const errors = validateActividadRegistroForm({
      fechaActividad: '2026-09-07',
      titulo: 'Control sector norte',
      ubicacion: 'Barrio Centro',
      observaciones: 'Sin novedad',
    })

    expect(Object.keys(errors)).toHaveLength(0)
  })
})
