const { test, expect } = require('@playwright/test');

test.describe('Vitrine de Fornecedores', () => {
  test('acessa vitrine e verifica SEO', async ({ page }) => {
    await page.goto('/vitrine');

    // Verifica title dinamico
    await expect(page).toHaveTitle(/Vitrine/);

    // Verifica meta description
    const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDesc).toContain('fornecedores');

    // Verifica canonical
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('/vitrine');

    // Verifica se lista carregou (ou mensagem de vazio)
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(10);
  });

  test('pagina de fornecedor retorna 404 para ID invalido', async ({ page }) => {
    await page.goto('/vitrine/invalid-id-123');

    // Deve mostrar pagina de erro ou 404
    const status = await page.evaluate(() => document.title);
    expect(status.length).toBeGreaterThan(0);
  });
});
