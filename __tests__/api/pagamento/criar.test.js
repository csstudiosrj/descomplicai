const { createMocks } = require('node-mocks-http');
const handler = require('../../../pages/api/pagamento/criar').default;

describe('POST /api/pagamento/criar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve retornar 405 para metodo GET', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Metodo nao permitido' });
  });

  test('deve retornar 400 quando fornecedor_id esta ausente', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { tipo: 'fornecedor', plano: 'basico' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'fornecedor_id obrigatorio' });
  });

  test('deve retornar 400 para tipo nao suportado', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { fornecedor_id: 'uuid-123', tipo: 'invalido', plano: 'basico' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Tipo nao suportado. Use tipo: "fornecedor"' });
  });

  test('deve retornar 404 quando fornecedor nao existe', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { fornecedor_id: 'uuid-inexistente', tipo: 'fornecedor', plano: 'basico' },
    });
    // O mock global ja retorna null para single()
    await handler(req, res);
    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Fornecedor nao encontrado' });
  });

  test('deve criar pagamento com dados validos e retornar preferenceId', async () => {
    // Configura o mock para retornar fornecedor existente
    const chain = mockSupabase._chain;
    chain.single.mockResolvedValue({
      data: { id: 'uuid-123', email: 'test@test.com', nome: 'Fornecedor Teste', valor_total: 100 },
      error: null,
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: { fornecedor_id: 'uuid-123', tipo: 'fornecedor', plano: 'premium' },
    });

    await handler(req, res);
    const data = JSON.parse(res._getData());
    expect(res._getStatusCode()).toBe(200);
    expect(data.success).toBe(true);
    expect(data.preference_id).toBe('pref-test-123');
    expect(data.init_point).toBe('https://mp.sandbox.com/checkout');
  });
});
