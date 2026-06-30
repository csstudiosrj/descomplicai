const { createMocks } = require('node-mocks-http');
const handler = require('../../../pages/api/cerimonialista/cadastro').default;

describe('POST /api/cerimonialista/cadastro', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve retornar 405 para metodo GET', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Metodo nao permitido' });
  });

  test('deve retornar 400 quando nome, email ou senha estao ausentes', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { nome: 'Joao', email: 'joao@test.com' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Nome, email e senha sao obrigatorios' });
  });

  test('deve retornar 400 para email invalido', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { nome: 'Joao', email: 'email-invalido', senha: '123456' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Email invalido' });
  });

  test('deve retornar 400 para senha curta', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { nome: 'Joao', email: 'joao@test.com', senha: '123' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Senha deve ter no minimo 6 caracteres' });
  });

  test('deve retornar 409 para email duplicado', async () => {
    const chain = mockSupabase._chain;
    chain.single.mockResolvedValue({ data: { id: 'existing-id' }, error: null });

    const { req, res } = createMocks({
      method: 'POST',
      body: { nome: 'Joao', email: 'joao@test.com', senha: '123456' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(409);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Email ja cadastrado' });
  });

  test('deve criar cerimonialista com dados validos', async () => {
    const chain = mockSupabase._chain;
    // Primeira chamada (verificar duplicado) retorna null
    chain.single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } });
    // Segunda chamada (insert) retorna o novo registro
    chain.single.mockResolvedValueOnce({
      data: { id: 'new-id', nome_empresa: 'Joao Silva', email: 'joao@test.com', senha_hash: '$2a$12$mockhash', status: 'ativo' },
      error: null,
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: { nome: 'Joao Silva', email: 'joao@test.com', senha: '123456', telefone: '11999999999', cidade: 'SP', estado: 'SP' },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.cerimonialista).toHaveProperty('id', 'new-id');
    expect(data.cerimonialista).not.toHaveProperty('senha_hash');
  });
});
