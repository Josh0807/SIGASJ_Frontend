import { describe, expect, it } from 'vitest'
import { FORMULARIO_DESCARGABLE_MAX_BYTES } from './types'
import {
  validateDescripcionFormularioDescargable,
  validateFormularioDescargablePdf,
  validateNombreFormularioDescargable,
} from './validateFormularioDescargable'

const pdf = (contents = '%PDF-1.7') =>
  new File([contents], 'formulario.pdf', { type: 'application/pdf' })

describe('validateFormularioDescargablePdf', () => {
  it('acepta un PDF con firma %PDF-', async () => {
    await expect(validateFormularioDescargablePdf(pdf())).resolves.toBeNull()
  })

  it('rechaza extensiones, MIME, vacíos y contenido falso', async () => {
    await expect(
      validateFormularioDescargablePdf(
        new File(['%PDF-'], 'archivo.txt', { type: 'application/pdf' }),
      ),
    ).resolves.toContain('.pdf')
    await expect(
      validateFormularioDescargablePdf(
        new File(['%PDF-'], 'archivo.pdf', { type: 'text/plain' }),
      ),
    ).resolves.toContain('application/pdf')
    await expect(
      validateFormularioDescargablePdf(
        new File([], 'archivo.pdf', { type: 'application/pdf' }),
      ),
    ).resolves.toContain('vacío')
    await expect(
      validateFormularioDescargablePdf(pdf('<html>')),
    ).resolves.toContain('PDF válido')
  })

  it('rechaza archivos mayores de 10 MB', async () => {
    const file = pdf()
    Object.defineProperty(file, 'size', {
      value: FORMULARIO_DESCARGABLE_MAX_BYTES + 1,
    })
    await expect(validateFormularioDescargablePdf(file)).resolves.toContain(
      '10 MB',
    )
  })
})

describe('validateNombreFormularioDescargable', () => {
  it('exige nombre no vacío y respeta maxlength', () => {
    expect(validateNombreFormularioDescargable('   ')).toContain('obligatorio')
    expect(validateNombreFormularioDescargable('Conexión')).toBeNull()
    expect(validateNombreFormularioDescargable('N'.repeat(201))).toContain(
      '200',
    )
  })
})

describe('validateDescripcionFormularioDescargable', () => {
  it('en edición permite vacía; en creación la exige', () => {
    expect(validateDescripcionFormularioDescargable('')).toBeNull()
    expect(
      validateDescripcionFormularioDescargable('', { required: true }),
    ).toContain('obligatoria')
    expect(
      validateDescripcionFormularioDescargable('   ', { required: true }),
    ).toContain('obligatoria')
    expect(
      validateDescripcionFormularioDescargable('Texto', { required: true }),
    ).toBeNull()
    expect(
      validateDescripcionFormularioDescargable('D'.repeat(1001)),
    ).toContain('1000')
  })
})
