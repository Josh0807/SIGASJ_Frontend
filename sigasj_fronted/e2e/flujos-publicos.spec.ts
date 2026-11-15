import { expect, test } from '@playwright/test'

/**
 * Flujos públicos críticos (sin sesión): landing → formularios / consultas.
 * No dependen del backend salvo interacciones de envío; aquí validamos carga y UI.
 */
test.describe('Flujos públicos completos', () => {
  test('landing enlaza a login y consulta de recibo', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /iniciar sesión/i }).first()).toBeVisible()
    await expect(
      page.locator('a[href="/consulta-recibo"]').first(),
    ).toBeVisible()
  })

  test('reportar avería carga el formulario público', async ({ page }) => {
    await page.goto('/reportar-averia')
    await expect(
      page.getByRole('heading', { name: 'Reportar una avería' }),
    ).toBeVisible()
    await expect(
      page.getByLabel('Formulario público de reporte de averías'),
    ).toBeVisible()
  })

  test('consulta de recibo muestra captura de paja', async ({ page }) => {
    await page.goto('/consulta-recibo')
    await expect(
      page.getByRole('heading', { name: 'Consulta de recibo' }),
    ).toBeVisible()
    await expect(
      page.getByLabel('Consulta pública de recibos'),
    ).toBeVisible()
  })

  test('seguimiento de solicitud valida campos vacíos en cliente', async ({
    page,
  }) => {
    await page.goto('/solicitudes/seguimiento')
    await expect(
      page.getByRole('heading', { name: 'Consultar estado de solicitud' }),
    ).toBeVisible()
    await page.getByRole('button', { name: /^Consultar/i }).click()
    await expect(page.locator('#tracking-code-error')).toContainText(
      /obligatorio/i,
    )
  })

  test('afiliación digital carga wizard de solicitud', async ({ page }) => {
    await page.goto('/solicitudes/afiliacion')
    await expect(
      page.getByRole('heading', { name: 'Solicitud de Afiliación' }),
    ).toBeVisible()
    await expect(
      page.getByLabel('Formulario público de afiliación'),
    ).toBeVisible()
  })

  test('cambio de titular y arreglo de pago cargan formularios', async ({
    page,
  }) => {
    await page.goto('/solicitudes/cambio-titular')
    await expect(page.locator('h1').first()).toBeVisible()

    await page.goto('/solicitudes/arreglo-pago')
    await expect(page.locator('h1').first()).toBeVisible()
  })
})
