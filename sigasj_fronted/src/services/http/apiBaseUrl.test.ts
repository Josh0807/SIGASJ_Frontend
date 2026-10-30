import { describe, expect, it } from 'vitest'
import { normalizeApiBaseUrl, requireProductionApiBaseUrl } from './apiBaseUrl'

describe('normalizeApiBaseUrl', () => {
  it('completa /api/v1 cuando solo llega el origen de Render', () => {
    expect(normalizeApiBaseUrl('https://sigasj-api.onrender.com')).toBe(
      'https://sigasj-api.onrender.com/api/v1',
    )
    expect(normalizeApiBaseUrl('https://sigasj-api.onrender.com/')).toBe(
      'https://sigasj-api.onrender.com/api/v1',
    )
  })

  it('acepta la base completa y descarta una barra final', () => {
    expect(normalizeApiBaseUrl('https://sigasj-api.onrender.com/api/v1/')).toBe(
      'https://sigasj-api.onrender.com/api/v1',
    )
    expect(normalizeApiBaseUrl('https://sigasj-api.onrender.com/api')).toBe(
      'https://sigasj-api.onrender.com/api/v1',
    )
  })

  it('rechaza un valor que no es una URL', () => {
    expect(() => normalizeApiBaseUrl('api/v1')).toThrow(/URL absoluta/)
  })
})

describe('requireProductionApiBaseUrl', () => {
  it('exige HTTPS en el build publicado', () => {
    expect(requireProductionApiBaseUrl('https://sigasj-api.onrender.com')).toBe(
      'https://sigasj-api.onrender.com/api/v1',
    )
    expect(() => requireProductionApiBaseUrl(undefined)).toThrow(/Falta VITE_API_URL/)
    expect(() => requireProductionApiBaseUrl('http://localhost:3000/api/v1')).toThrow(/HTTPS/)
  })
})
