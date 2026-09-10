import { afterEach, describe, expect, it, vi } from 'vitest'
import { getBackendOrigin, resolveBackendAssetUrl } from './assetUrl'

describe('resolveBackendAssetUrl', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('deriva el origen desde VITE_API_URL sin conservar /api/v1', () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api/v1')
    vi.stubEnv('VITE_BACKEND_URL', '')
    expect(getBackendOrigin()).toBe('http://localhost:3000')
    expect(resolveBackendAssetUrl('/uploads/galeria/tanque.jpg')).toBe('http://localhost:3000/uploads/galeria/tanque.jpg')
  })

  it('respeta VITE_BACKEND_URL cuando está configurada', () => {
    vi.stubEnv('VITE_BACKEND_URL', 'https://api.asada.example/')
    expect(resolveBackendAssetUrl('uploads/comunicados/aviso.jpg')).toBe('https://api.asada.example/uploads/comunicados/aviso.jpg')
  })

  it('conserva URLs absolutas y assets locales de Vite', () => {
    expect(resolveBackendAssetUrl('https://cdn.example/foto.jpg')).toBe('https://cdn.example/foto.jpg')
    expect(resolveBackendAssetUrl('/assets/logo.abc.png')).toBe('/assets/logo.abc.png')
    expect(resolveBackendAssetUrl('blob:http://localhost/preview')).toBe('blob:http://localhost/preview')
  })

  it('normaliza barras invertidas provenientes de datos antiguos', () => {
    vi.stubEnv('VITE_BACKEND_URL', 'http://localhost:3000')
    expect(resolveBackendAssetUrl('uploads\\galeria\\tanque.jpg')).toBe('http://localhost:3000/uploads/galeria/tanque.jpg')
  })
})
