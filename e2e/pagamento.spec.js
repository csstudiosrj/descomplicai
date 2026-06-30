const { test, expect } = require('@playwright/test');

test.describe('Fluxo de Pagamento', () => {
  test('API de pagamento retorna 400 sem fornecedor_id', async ({ page }) => {
    // Faz request direto para a API
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/pagamento/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'fornecedor', plano: 'basico' }),
      });
      return { status: res.status, body: await res.json() };
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('fornecedor_id');
  });

  test('API de pagamento retorna 404 para fornecedor inexistente', async ({ page }) => {
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/pagamento/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fornecedor_id: 'uuid-fake-123', tipo: 'fornecedor', plano: 'basico' }),
      });
      return { status: res.status, body: await res.json() };
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toContain('Fornecedor');
  });
});
