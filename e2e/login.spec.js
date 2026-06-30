const { test, expect } = require('@playwright/test');

test.describe('Fluxo de Login', () => {
  test('pagina de login carrega corretamente', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Entrar/);

    // Verifica se formulario existe
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login com credenciais invalidas mostra erro', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'invalido@test.com');
    await page.fill('input[type="password"]', 'senhaerrada123');
    await page.click('button[type="submit"]');

    // Aguarda mensagem de erro
    await expect(page.locator('text=/Erro|erro|Invalid|invalid/i')).toBeVisible({ timeout: 10000 });
  });
});
