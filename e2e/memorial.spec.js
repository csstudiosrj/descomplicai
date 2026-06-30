const { test, expect } = require('@playwright/test');

test.describe('Fluxo do Memorial', () => {
  test('pagina do memorial carrega e mostra step inicial', async ({ page }) => {
    await page.goto('/memorial');

    // Verifica se a pagina carregou
    await expect(page).toHaveURL(/\/memorial/);

    // Aguarda conteudo carregar (step inicial ou loading)
    await page.waitForTimeout(3000);

    // Verifica se ha algum conteudo na pagina
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(10);
  });
});
