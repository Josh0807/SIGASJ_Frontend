import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const productionFiles = [
  'ProyectosAdminPage.tsx',
  'ProyectosAdminCreatePage.tsx',
  'ProyectosAdminEditPage.tsx',
  'ProyectosAdminDetailPage.tsx',
  'ProyectosAdminDetailView.tsx',
  'ProyectosAdminDetailGallery.tsx',
  'ProyectosAdminForm.tsx',
  'ProyectosAdminFormPageLayout.tsx',
  'ProyectosAdminTable.tsx',
  'ProyectosAdminRowActions.tsx',
  'ProyectosAdminPagination.tsx',
  'ProyectosAdminQueryStates.tsx',
  'ProyectosAdminRoutes.tsx',
  'ProyectosAdminMissingState.tsx',
  'proyectosAdminPaths.ts',
  'types.ts',
  'validateProyectoForm.ts',
  'formatProyectoAdminDate.ts',
  'proyectoSubmitError.ts',
]

describe('ProyectosAdmin — sin datos temporales de producción', () => {
  it('no incluye catálogos mock, ids fijos ni fechas inventadas en el flujo real', () => {
    const adminDir = dirname(fileURLToPath(import.meta.url))
    const relatedFiles = [
      ...productionFiles.map((file) => join(adminDir, file)),
      join(adminDir, '..', 'hooks', 'useAdminProyectos.ts'),
      join(adminDir, '..', 'hooks', 'useAdminProyecto.ts'),
      join(adminDir, '..', 'hooks', 'proyectosAdminQuery.ts'),
      join(adminDir, '..', 'services', 'proyectosApi.ts'),
      join(adminDir, '..', 'types', 'estadoProyecto.ts'),
    ]

    for (const file of relatedFiles) {
      const source = readFileSync(file, 'utf8')

      expect(source, file).not.toMatch(/adminProyectosMocks|proyectosMocks|MOCK_PROYECT/)
      expect(source, file).not.toContain('Red de agua potable')
      expect(source, file).not.toContain('Tanque de almacenamiento')
      expect(source, file).not.toContain('Ing. María')
      expect(source, file).not.toContain('2026-01-01T00:00:00.000Z')
      expect(source, file).not.toContain('EN_EJECUCION')
      expect(source, file).not.toContain('location.reload')
    }
  })
})
