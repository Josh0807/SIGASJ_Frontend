import { describe, expect, it } from 'vitest'
import { evidenciaActividadEndpoint } from './evidenciaActividadUrl'

describe('evidenciaActividadEndpoint', () => {
  it('conserva la ruta privada informada por el backend sin convertirla a uploads', () => {
    expect(evidenciaActividadEndpoint('/api/v1/fontanero/actividades/6/documentos/foto.jpg', 6))
      .toBe('/fontanero/actividades/6/documentos/foto.jpg')
  })

  it('extrae la ruta API de una URL absoluta del backend', () => {
    expect(evidenciaActividadEndpoint('https://api.example.com/api/v1/fontanero/actividades/6/documentos/foto.jpg', 6))
      .toBe('/fontanero/actividades/6/documentos/foto.jpg')
  })

  it('construye la ruta documentada cuando el backend devuelve solo el nombre', () => {
    expect(evidenciaActividadEndpoint('foto 1.jpg', 6))
      .toBe('/fontanero/actividades/6/documentos/foto%201.jpg')
  })

  it('rechaza rutas no reconocidas o con traversal', () => {
    expect(evidenciaActividadEndpoint('../secreto.jpg', 6)).toBeNull()
    expect(evidenciaActividadEndpoint('/otra/ruta/foto.jpg', 6)).toBeNull()
  })
})
