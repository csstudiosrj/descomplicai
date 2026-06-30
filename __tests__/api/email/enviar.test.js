/**
 * @jest-environment node
 */

const { createMocks } = require('node-mocks-http');

// Mock local do lib/email (path correto a partir deste teste)
jest.mock('../../../lib/email', () => ({
  enviarEmailTemplate: jest.fn().mockResolvedValue({ id: 'email-test-id', error: null }),
}));

const handler = require('../../../pages/api/email/enviar').default;

describe('POST /api/email/enviar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve retornar 405 para metodo GET', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Metodo nao permitido' });
  });

  test('deve retornar 400 quando para ou template estao ausentes', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { para: 'test@test.com' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Campos obrigatorios: para, template' });
  });

  test('deve retornar 400 para email invalido', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { para: 'email-invalido', template: 'boas-vindas' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'E-mail invalido' });
  });

  test('deve enviar email com template valido e retornar 200', async () => {
    const { enviarEmailTemplate } = require('../../../lib/email');
    enviarEmailTemplate.mockResolvedValue({ id: 'email-123', error: null });

    const { req, res } = createMocks({
      method: 'POST',
      body: { para: 'test@example.com', template: 'boas-vindas', variaveis: { nome: 'Joao' } },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.id).toBe('email-123');
  });

  test('deve retornar 500 quando envio falha', async () => {
    const { enviarEmailTemplate } = require('../../../lib/email');
    enviarEmailTemplate.mockResolvedValue({ id: null, error: new Error('SMTP timeout') });

    const { req, res } = createMocks({
      method: 'POST',
      body: { para: 'test@example.com', template: 'boas-vindas' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Falha ao enviar e-mail');
  });
});
