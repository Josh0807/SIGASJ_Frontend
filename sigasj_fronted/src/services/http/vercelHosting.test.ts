import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  LANDING_ROUTE_PATH,
  LOGIN_ROUTE_PATH,
  OTHER_FORMS_ROUTE_PATH,
  PROYECTO_DETAIL_PUBLIC_ROUTE_PATH,
  RECEIPT_QUERY_ROUTE_PATH,
  REPORTAR_AVERIA_ROUTE_PATH,
  REQUEST_TRACKING_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../app/router/routePaths'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')

describe('publicación en Vercel', () => {
  const config = JSON.parse(readFileSync(resolve(repoRoot, 'vercel.json'), 'utf8')) as {
    framework: string
    installCommand: string
    buildCommand: string
    outputDirectory: string
    rewrites: { source: string; destination: string }[]
    headers: { source: string; headers: { key: string; value: string }[] }[]
  }

  it('construye la app de Vite que vive en sigasj_fronted', () => {
    expect(config.framework).toBe('vite')
    expect(config.installCommand).toContain('sigasj_fronted')
    expect(config.buildCommand).toContain('check-render-api-url.cjs')
    expect(config.buildCommand).toContain('npm run build --prefix sigasj_fronted')
    expect(config.outputDirectory).toBe('sigasj_fronted/dist')
  })

  it('devuelve index.html en rutas públicas y privadas para que React resuelva el acceso', () => {
    expect(config.rewrites).toEqual([{ source: '/(.*)', destination: '/index.html' }])
    const publicPaths = [
      LANDING_ROUTE_PATH,
      LOGIN_ROUTE_PATH,
      UNAUTHORIZED_ROUTE_PATH,
      RECEIPT_QUERY_ROUTE_PATH,
      REPORTAR_AVERIA_ROUTE_PATH,
      PROYECTO_DETAIL_PUBLIC_ROUTE_PATH,
      OTHER_FORMS_ROUTE_PATH,
      REQUEST_TRACKING_ROUTE_PATH,
    ]
    for (const path of publicPaths) {
      expect(path.startsWith('/admin')).toBe(false)
      expect(path.startsWith('/fontanero')).toBe(false)
    }
  })

  it('obliga HTTPS con HSTS y el HTML declara viewport', () => {
    const headers = config.headers.flatMap((entry) => entry.headers)
    expect(headers).toContainEqual(
      expect.objectContaining({
        key: 'Strict-Transport-Security',
        value: expect.stringContaining('max-age='),
      }),
    )
    const html = readFileSync(resolve(repoRoot, 'sigasj_fronted/index.html'), 'utf8')
    expect(html).toContain('width=device-width')
  })
})
