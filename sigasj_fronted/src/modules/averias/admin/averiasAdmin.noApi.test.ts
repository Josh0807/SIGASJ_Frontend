import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const adminDir = dirname(fileURLToPath(import.meta.url))
const hooksDir = join(adminDir, '../hooks')
const apiFile = join(adminDir, '../services/averiasAdminApi.ts')
const pageFile = join(adminDir, 'AveriasAdminPage.tsx')
const detailFile = join(adminDir, 'AveriasAdminDetailPage.tsx')

const listTsFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      return listTsFiles(full)
    }
    return entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')
      ? [full]
      : []
  })

describe('Averías admin — integración de consulta', () => {
  it('no filtra ni pagina en cliente y no muta averías', () => {
    const files = [
      ...listTsFiles(adminDir),
      ...listTsFiles(hooksDir),
      apiFile,
    ].filter((file) => !file.includes('.test.') && !file.includes('fixtures'))

    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      expect(source, file).not.toMatch(/items\.filter\s*\(/)
      expect(source, file).not.toMatch(/items\.slice\s*\(/)
      expect(source, file).not.toMatch(/method:\s*['"]POST['"]/)
      expect(source, file).not.toMatch(/method:\s*['"]PATCH['"]/)
      expect(source, file).not.toMatch(/method:\s*['"]PUT['"]/)
      expect(source, file).not.toMatch(/method:\s*['"]DELETE['"]/)
      expect(source, file).not.toMatch(/useQuery\s*\(/)
      expect(source, file).not.toMatch(/axios/)
    }
  })

  it('quita fixtures del flujo productivo', () => {
    expect(readFileSync(pageFile, 'utf8')).not.toMatch(
      /AVERIAS_ADMIN_UI_FIXTURE/,
    )
    expect(readFileSync(detailFile, 'utf8')).not.toMatch(
      /findAveriaDetailFixture/,
    )
  })
})
