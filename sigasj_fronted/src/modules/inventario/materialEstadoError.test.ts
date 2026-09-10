import { describe, expect, it } from 'vitest'
import { parseMaterialEstadoError } from './materialEstadoError'

describe('errores de estado de materiales', () => {
  it.each([400, 401, 403, 404])('maneja HTTP %s', (status) => {
    const parsed = parseMaterialEstadoError(new Error(`HTTP ${status}: error`))
    expect(parsed.status).toBe(status)
    expect(parsed.message.length).toBeGreaterThan(10)
  })
})
