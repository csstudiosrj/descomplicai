const { createMocks } = require('node-mocks-http');
const handler = require('../../../pages/api/convite/validar').default;

describe('POST /api/convite/validar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve retornar 405 para metodo PUT', async () => {
    const { req, res } = createMocks({ method: 'PUT' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Metodo nao permitido' });
  });

  test('deve retornar 400 quando token esta ausente', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Token e obrigatorio' });
  });

  test('deve retornar 404 para token inexistente', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { token: 'token-invalido' } });
    // Mock global ja retorna null
    await handler(req, res);
    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Convite nao encontrado' });
  });

  test('deve retornar 410 para token expirado', async () => {
    const expirado = new Date(Date.now() - 86400000).toISOString();
    const chain = mockSupabase._chain;
    chain.single.mockResolvedValue({
      data: {
        id: 'conv-1',
        token: 'token-expirado',
        expira_em: expirado,
        usado_em: null,
        evento_id: 'evt-1',
        tipo: 'casal',
        eventos: { nome_evento: 'Casamento Teste' },
      },
      error: null,
    });

    const { req, res } = createMocks({ method: 'POST', body: { token: 'token-expirado' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(410);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Convite expirado' });
  });

  test('deve retornar 409 para token ja usado', async () => {
    const chain = mockSupabase._chain;
    chain.single.mockResolvedValue({
      data: {
        id: 'conv-2',
        token: 'token-usado',
        expira_em: null,
        usado_em: new Date().toISOString(),
        evento_id: 'evt-1',
        tipo: 'casal',
        eventos: { nome_evento: 'Casamento Teste' },
      },
      error: null,
    });

    const { req, res } = createMocks({ method: 'POST', body: { token: 'token-usado' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(409);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Convite ja foi utilizado' });
  });

  test('deve retornar 200 com dados validos para token valido', async () => {
    const chain = mockSupabase._chain;
    chain.single.mockResolvedValue({
      data: {
        id: 'conv-3',
        token: 'token-valido',
        expira_em: new Date(Date.now() + 86400000).toISOString(),
        usado_em: null,
        evento_id: 'evt-1',
        tipo: 'casal',
        eventos: { nome_evento: 'Casamento Teste' },
      },
      error: null,
    });

    const { req, res } = createMocks({ method: 'POST', body: { token: 'token-valido' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.valido).toBe(true);
    expect(data.convite.nomeEvento).toBe('Casamento Teste');
  });
});
