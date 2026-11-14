import { expect, test } from '@playwright/test'

/**
 * Smoke visual de superficies públicas/login.
 * Las rutas admin protegidas requieren sesión; este suite valida
 * que el shell carga y que no hay regresiones obvias de layout.
 */
test.describe('SIGASJ visual smoke', () => {
  test('landing carga con tipografía y CTA visibles', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    await expect(page).toHaveScreenshot('landing.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.04,
    })
  })

  test('login muestra formulario ASADA', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page).toHaveScreenshot('login.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.04,
    })
  })
})
