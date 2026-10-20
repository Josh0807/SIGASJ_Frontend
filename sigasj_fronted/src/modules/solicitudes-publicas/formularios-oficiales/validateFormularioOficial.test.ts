import { describe, expect, it } from 'vitest'
import { FORMULARIO_OFICIAL_MAX_BYTES } from './types'
import { validateFormularioOficial } from './validateFormularioOficial'

const pdf = (contents = '%PDF-1.7') => new File([contents], 'formulario.pdf', { type: 'application/pdf' })

describe('validateFormularioOficial', () => {
  it('acepta un PDF cuyo contenido inicia con la firma oficial', async () => {
    await expect(validateFormularioOficial(pdf())).resolves.toBeNull()
  })

  it('rechaza extensiones, MIME, archivos vacíos y contenido falso', async () => {
    await expect(validateFormularioOficial(new File(['%PDF-'], 'archivo.txt', { type: 'application/pdf' }))).resolves.toContain('.pdf')
    await expect(validateFormularioOficial(new File(['%PDF-'], 'archivo.pdf', { type: 'text/plain' }))).resolves.toContain('application/pdf')
    await expect(validateFormularioOficial(new File([], 'archivo.pdf', { type: 'application/pdf' }))).resolves.toContain('vacío')
    await expect(validateFormularioOficial(pdf('<html>'))).resolves.toContain('PDF válido')
  })

  it('rechaza archivos mayores de 10 MB', async () => {
    const file = pdf()
    Object.defineProperty(file, 'size', { value: FORMULARIO_OFICIAL_MAX_BYTES + 1 })
    await expect(validateFormularioOficial(file)).resolves.toContain('10 MB')
  })
})
