import { describe, expect, it } from 'vitest'
import { emptyProyectoFormValues, type ProyectoFormValues } from './types'
import {
  PROYECTO_DURACION_MAX_LENGTH,
  PROYECTO_ENCARGADO_MAX_LENGTH,
  PROYECTO_NOMBRE_MAX_LENGTH,
  getProyectoFormValidationError,
  validateProyectoForm,
  validateProyectoImagenFile,
} from './validateProyectoForm'

const validValues = (): ProyectoFormValues => ({
  nombre: 'Ampliación de Acueducto',
  descripcion: '',
  encargadoRealizacion: 'Ing. María Rodríguez',
  duracion: '8 meses',
  estado: 'PENDIENTE',
})

describe('validateProyectoForm', () => {
  it('acepta un alta con descripción vacía porque el Backend no la exige', () => {
    expect(validateProyectoForm(validValues())).toBeNull()
    expect(
      validateProyectoForm({
        ...validValues(),
        descripcion: '   ',
      }),
    ).toBeNull()
  })

  it('rechaza nombre vacío o solo espacios y respeta el máximo de 200', () => {
    expect(validateProyectoForm({ ...validValues(), nombre: '' })).toBe(
      'El nombre del proyecto es obligatorio.',
    )
    expect(validateProyectoForm({ ...validValues(), nombre: '   ' })).toBe(
      'El nombre del proyecto es obligatorio.',
    )
    expect(
      validateProyectoForm({
        ...validValues(),
        nombre: 'a'.repeat(PROYECTO_NOMBRE_MAX_LENGTH + 1),
      }),
    ).toBe('El nombre del proyecto no puede superar 200 caracteres.')
  })

  it('exige encargado como texto y respeta el máximo de 150', () => {
    expect(
      validateProyectoForm({ ...validValues(), encargadoRealizacion: '' }),
    ).toBe('Debe indicar el encargado.')
    expect(
      validateProyectoForm({ ...validValues(), encargadoRealizacion: '   ' }),
    ).toBe('Debe indicar el encargado.')
    expect(
      validateProyectoForm({
        ...validValues(),
        encargadoRealizacion: 'a'.repeat(PROYECTO_ENCARGADO_MAX_LENGTH + 1),
      }),
    ).toBe('El encargado no puede superar 150 caracteres.')
  })

  it('exige duración como texto libre, sin exigir un número', () => {
    expect(validateProyectoForm({ ...validValues(), duracion: '' })).toBe(
      'La duración es obligatoria.',
    )
    expect(validateProyectoForm({ ...validValues(), duracion: '   ' })).toBe(
      'La duración es obligatoria.',
    )
    expect(validateProyectoForm({ ...validValues(), duracion: '6' })).toBeNull()
    expect(
      validateProyectoForm({
        ...validValues(),
        duracion: 'a'.repeat(PROYECTO_DURACION_MAX_LENGTH + 1),
      }),
    ).toBe('La duración no puede superar 100 caracteres.')
  })

  it('solo acepta los estados reales del Backend', () => {
    expect(validateProyectoForm({ ...validValues(), estado: '' })).toBe(
      'Seleccione un estado válido.',
    )
    expect(
      validateProyectoForm({
        ...validValues(),
        estado: 'EN_EJECUCION' as ProyectoFormValues['estado'],
      }),
    ).toBe('Seleccione un estado válido.')
    expect(validateProyectoForm({ ...validValues(), estado: 'EN_PROCESO' })).toBeNull()
    expect(validateProyectoForm({ ...validValues(), estado: 'COMPLETADO' })).toBeNull()
  })

  it('asocia cada error de validación con el campo correspondiente', () => {
    expect(getProyectoFormValidationError({ ...validValues(), nombre: '' })).toEqual({
      field: 'nombre',
      message: 'El nombre del proyecto es obligatorio.',
    })
    expect(
      getProyectoFormValidationError({ ...validValues(), encargadoRealizacion: '' }),
    ).toEqual({
      field: 'encargadoRealizacion',
      message: 'Debe indicar el encargado.',
    })
    expect(getProyectoFormValidationError({ ...validValues(), duracion: '' })).toEqual({
      field: 'duracion',
      message: 'La duración es obligatoria.',
    })
    expect(getProyectoFormValidationError({ ...validValues(), estado: '' })).toEqual({
      field: 'estado',
      message: 'Seleccione un estado válido.',
    })
    expect(getProyectoFormValidationError(validValues())).toBeNull()
  })
})

describe('emptyProyectoFormValues', () => {
  it('parte sin estado seleccionado para exigir uno válido en el alta', () => {
    expect(emptyProyectoFormValues()).toEqual({
      nombre: '',
      descripcion: '',
      encargadoRealizacion: '',
      duracion: '',
      estado: '',
      imagenPrincipalUrl: null,
    })
  })
})

describe('validateProyectoImagenFile', () => {
  it('acepta formatos válidos (JPG, PNG, WEBP, GIF) dentro del límite de 5 MB', () => {
    const validJpg = new File(['dummy'], 'cover.jpg', { type: 'image/jpeg' })
    const validPng = new File(['dummy'], 'cover.png', { type: 'image/png' })
    const validWebp = new File(['dummy'], 'cover.webp', { type: 'image/webp' })
    const validGif = new File(['dummy'], 'cover.gif', { type: 'image/gif' })

    expect(validateProyectoImagenFile(validJpg)).toBeNull()
    expect(validateProyectoImagenFile(validPng)).toBeNull()
    expect(validateProyectoImagenFile(validWebp)).toBeNull()
    expect(validateProyectoImagenFile(validGif)).toBeNull()
  })

  it('rechaza archivos que superan los 5 MB', () => {
    const bigBuffer = new Uint8Array(5 * 1024 * 1024 + 1)
    const bigFile = new File([bigBuffer], 'large-cover.jpg', { type: 'image/jpeg' })

    expect(validateProyectoImagenFile(bigFile)).toBe(
      'El archivo supera el tamaño máximo permitido (5 MB).',
    )
  })

  it('rechaza formatos de archivo no permitidos (ej. PDF, TXT, SVG, EXE)', () => {
    const pdfFile = new File(['pdf content'], 'document.pdf', {
      type: 'application/pdf',
    })
    const txtFile = new File(['text'], 'notes.txt', { type: 'text/plain' })
    const fakeJpg = new File(['%PDF-1.4'], 'portada.jpg', {
      type: 'application/pdf',
    })

    expect(validateProyectoImagenFile(pdfFile)).toBe(
      'Formato de imagen no permitido. Solo se aceptan imágenes JPG, PNG, WEBP o GIF.',
    )
    expect(validateProyectoImagenFile(txtFile)).toBe(
      'Formato de imagen no permitido. Solo se aceptan imágenes JPG, PNG, WEBP o GIF.',
    )
    expect(validateProyectoImagenFile(fakeJpg)).toBe(
      'Formato de imagen no permitido. Solo se aceptan imágenes JPG, PNG, WEBP o GIF.',
    )
  })
})
