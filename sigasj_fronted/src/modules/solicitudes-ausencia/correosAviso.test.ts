import { describe, expect, it } from 'vitest'
import {
  normalizarCorreosAviso,
  parseCorreosAviso,
  validarListaCorreosAviso,
} from './correosAviso'

describe('correosAviso', () => {
  it('acepta varios correos separados por coma o espacio', () => {
    expect(
      parseCorreosAviso('aviso@asadasanjuan.cr, jefe@asadasanjuan.cr'),
    ).toEqual(['aviso@asadasanjuan.cr', 'jefe@asadasanjuan.cr'])
    expect(normalizarCorreosAviso('Uno@Asada.cr  DOS@asada.cr')).toBe(
      'uno@asada.cr, dos@asada.cr',
    )
    expect(validarListaCorreosAviso('ok@asada.cr, jefe@asada.cr')).toBeNull()
  })

  it('rechaza listas vacías o con un correo inválido', () => {
    expect(validarListaCorreosAviso('')).not.toBeNull()
    expect(validarListaCorreosAviso('aviso@asada.cr, malo')).toMatch(/malo/)
  })
})
