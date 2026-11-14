import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const readSource = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8')

describe('integracion del logout reutilizable', () => {
  it('AdminHeader delega el cierre en el hook generico mediante su menu', () => {
    const header = readSource(
      'src/modules/admin-panel/components/AdminHeader.tsx',
    )
    const accountMenu = readSource(
      'src/modules/admin-panel/components/AdminAccountMenu.tsx',
    )

    expect(header).toContain('<AdminAccountMenu')
    expect(accountMenu).toContain("from '../../auth/hooks/useLogout'")
    expect(accountMenu).toContain('const logout = useLogout()')
    expect(accountMenu).not.toContain('clearAuthSession')
    expect(accountMenu).not.toContain('clearAccessToken')
    expect(accountMenu).not.toContain('localStorage')
  })

  it('el menu alternativo usa la misma operacion y no duplica limpieza', () => {
    const userMenu = readSource(
      'src/modules/admin-panel/components/AdminUserMenu.tsx',
    )

    expect(userMenu).toContain("from '../../auth/hooks/useLogout'")
    expect(userMenu).toContain('const logout = useLogout()')
    expect(userMenu).not.toContain('clearAuthSession')
    expect(userMenu).not.toContain('clearAccessToken')
    expect(userMenu).not.toContain('localStorage')
  })

  it('el alias administrativo no contiene otra implementacion de logout', () => {
    const compatibilityAlias = readSource(
      'src/modules/auth/hooks/useAdminLogout.ts',
    )

    expect(compatibilityAlias).toContain(
      "export { useLogout as useAdminLogout } from './useLogout'",
    )
    expect(compatibilityAlias).not.toContain('useNavigate')
    expect(compatibilityAlias).not.toContain('clearAuthSession')
  })
})
