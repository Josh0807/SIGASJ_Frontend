import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { InternalAdminRoleName } from '../auth/utils/internalRoles'

/**
 * FE ya exponía movimientos/reportes a Secretaria; el gap era el BE.
 * Este test fija el contrato de rutas para no regresionar a adminOnly.
 */
describe('InventarioRoutes — contrato roles movimientos/reportes', () => {
  const source = readFileSync(
    join(__dirname, 'InventarioRoutes.tsx'),
    'utf8',
  )

  it('define adminAndSecretaria con Administradora y Secretaria', () => {
    expect(source).toContain('adminAndSecretaria')
    expect(source).toContain(InternalAdminRoleName.Administradora)
    expect(source).toContain(InternalAdminRoleName.Secretaria)
    expect(source).toMatch(
      /path="movimientos"[\s\S]*?allowedRoles=\{adminAndSecretaria\}/,
    )
    expect(source).toMatch(
      /path="reportes"[\s\S]*?allowedRoles=\{adminAndSecretaria\}/,
    )
  })

  it('no usa adminOnly en movimientos ni reportes', () => {
    expect(source).not.toMatch(
      /path="movimientos"[\s\S]*?allowedRoles=\{adminOnly\}/,
    )
    expect(source).not.toMatch(
      /path="reportes"[\s\S]*?allowedRoles=\{adminOnly\}/,
    )
  })
})
