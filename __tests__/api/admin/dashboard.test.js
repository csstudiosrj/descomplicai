const { createMocks } = require('node-mocks-http');
const handler = require('../../../pages/api/admin/dashboard').default;

describe('GET /api/admin/dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve retornar 405 para metodo POST', async () => {
    const { req, res } = createMocks({ method: 'POST' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Method not allowed' });
  });

  test('deve retornar 403 para usuario nao-admin', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: { authorization: 'Bearer token-nao-admin' },
    });
    // Mock auth retorna usuario, mas admins retorna null
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    // single() ja retorna null por padrao
    await handler(req, res);
    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Acesso negado. Apenas administradores.' });
  });

  test('deve retornar 403 sem token de autenticacao', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Acesso negado. Apenas administradores.' });
  });

  test('deve retornar 200 com metricas para admin autenticado', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: { authorization: 'Bearer token-admin' },
    });

    // Mock auth retorna admin
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-123' } },
      error: null,
    });

    // Configura chain para retornar admin e dados
    const chain = mockSupabase._chain;
    chain.single.mockImplementation(() => {
      // A primeira chamada e para admins (verificar se e admin)
      // As proximas sao para outras tabelas
      return Promise.resolve({ data: { id: 'admin-123' }, error: null });
    });
    chain.limit.mockResolvedValue({ data: [], error: null });
    chain.rpc.mockResolvedValue({ data: [], error: null });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('metrics');
    expect(data).toHaveProperty('abandono');
    expect(data).toHaveProperty('paginas');
    expect(data).toHaveProperty('tempo');
    expect(data).toHaveProperty('funil');
    expect(data).toHaveProperty('fornecedoresPendentes');
    expect(data).toHaveProperty('alertas');
    expect(data.periodoDias).toBe(30);
  });
});
