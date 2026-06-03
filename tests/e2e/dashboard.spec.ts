import { expect, test } from '@playwright/test'

test.describe('GitHub Dashboard — flujo principal', () => {
  test('muestra el estado vacío inicial', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Busca un usuario de GitHub')).toBeVisible()
    await expect(page.getByPlaceholder('Usuario de GitHub...')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible()
  })

  test('carga y muestra el perfil de un usuario', async ({ page }) => {
    await page.goto('/?user=octocat')
    await expect(page.getByText('octocat').first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('@octocat')).toBeVisible()
  })

  test('carga un perfil al navegar a ?user=username', async ({ page }) => {
    // Prueba que el URL routing funciona: entrar con ?user= carga el perfil correcto
    await page.goto('/?user=torvalds')
    await expect(page).toHaveURL(/user=torvalds/)
    await expect(page.getByText('@torvalds')).toBeVisible({ timeout: 15_000 })
  })

  test('muestra las stats cards tras cargar', async ({ page }) => {
    await page.goto('/?user=octocat')
    await expect(page.getByText('Estrellas', { exact: true })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Forks', { exact: true })).toBeVisible()
    await expect(page.getByText('Seguidores', { exact: true })).toBeVisible()
  })

  test('muestra la lista de repositorios', async ({ page }) => {
    await page.goto('/?user=octocat')
    const repoCards = page.locator('a[href*="github.com/octocat"]')
    await expect(repoCards.first()).toBeVisible({ timeout: 15_000 })
  })

  test('el input de búsqueda filtra repositorios', async ({ page }) => {
    await page.goto('/?user=octocat')
    await page.locator('a[href*="github.com/octocat"]').first().waitFor({ timeout: 15_000 })
    await page.waitForTimeout(500)

    await page.getByPlaceholder('Buscar repositorios...').fill('Hello-World')
    await page.waitForTimeout(400) // debounce
    await expect(page.locator('a[href*="Hello-World"]').first()).toBeVisible()
  })

  test('muestra error para un usuario inexistente', async ({ page }) => {
    // Username válido (< 39 chars) que no existe en GitHub
    await page.goto('/?user=user-xyz-not-real-abc99')
    await expect(
      page.getByText(/usuario no encontrado|no encontrado/i),
    ).toBeVisible({ timeout: 15_000 })
  })

  test('el botón Reintentar re-ejecuta la búsqueda', async ({ page }) => {
    await page.goto('/?user=user-xyz-not-real-abc99')
    await page.getByText('Reintentar').waitFor({ timeout: 15_000 })
    await page.getByRole('button', { name: 'Reintentar' }).click()
    await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible({ timeout: 10_000 })
  })

  test('el navbar es visible al hacer scroll', async ({ page }) => {
    await page.goto('/?user=octocat')
    await page.waitForTimeout(3_000)
    await page.evaluate(() => window.scrollTo(0, 1000))
    // Usar el locator del nav específicamente
    await expect(page.locator('nav').getByText('GitHub Dashboard', { exact: true })).toBeVisible()
  })
})
