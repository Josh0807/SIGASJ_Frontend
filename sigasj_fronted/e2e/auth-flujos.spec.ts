import { expect, test } from '@playwright/test'

/**
 * Gates de autenticación y login (cliente).
 * Login contra API real solo si PLAYWRIGHT_E2E_EMAIL / PLAYWRIGHT_E2E_PASSWORD están definidos.
 */
test.describe('Auth y panel protegido', () => {
  test('rutas admin redirigen a login sin sesión', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/login/)
    await expect(
      page.getByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeVisible()
  })

  test('/admin/inventario redirige a login sin sesión', async ({ page }) => {
    await page.goto('/admin/inventario')
    await expect(page).toHaveURL(/\/login/)
  })

  test('/admin/averias redirige a login sin sesión', async ({ page }) => {
    await page.goto('/admin/averias')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login valida correo inválido sin llamar API', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#login-email').fill('correo-invalido')
    await page.locator('#login-password').fill('secreto123')
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()
    await expect(page.getByRole('alert').first()).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('login exige contraseña', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#login-email').fill('admin@asadasanjuan.cr')
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()
    await expect(page.getByRole('alert').first()).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('login con credenciales E2E entra al panel', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_E2E_EMAIL
    const password = process.env.PLAYWRIGHT_E2E_PASSWORD
    test.skip(
      !email || !password,
      'Definir PLAYWRIGHT_E2E_EMAIL y PLAYWRIGHT_E2E_PASSWORD para login real',
    )

    await page.goto('/login')
    await page.locator('#login-email').fill(email!)
    await page.locator('#login-password').fill(password!)
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()
    await expect(page).toHaveURL(/\/admin/, { timeout: 30_000 })
    await expect(page.locator('body')).not.toContainText('Iniciar sesión')
  })
})
