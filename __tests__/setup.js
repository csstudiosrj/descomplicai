/**
 * Setup global para testes de integracao
 * Mocks: Supabase, Mercado Pago, bcrypt, Upstash Ratelimit
 */

function createMockSupabase(defaultSingle = { data: null, error: { message: 'not found' } }) {
  const chain = {
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    update: jest.fn(() => chain),
    delete: jest.fn(() => chain),
    upsert: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    neq: jest.fn(() => chain),
    gt: jest.fn(() => chain),
    lt: jest.fn(() => chain),
    gte: jest.fn(() => chain),
    lte: jest.fn(() => chain),
    or: jest.fn(() => chain),
    in: jest.fn(() => chain),
    order: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    range: jest.fn(() => chain),
    single: jest.fn(() => Promise.resolve(defaultSingle)),
    maybeSingle: jest.fn(() => Promise.resolve(defaultSingle)),
    rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
  };

  return {
    from: jest.fn(() => chain),
    rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      admin: {
        createUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'user-test-id' } }, error: null })),
        deleteUser: jest.fn(() => Promise.resolve({ error: null })),
      },
    },
    _chain: chain,
  };
}

const mockSupabase = createMockSupabase();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn(() => ({})),
  Preference: jest.fn().mockImplementation(() => ({
    create: jest.fn().mockResolvedValue({
      id: 'pref-test-123',
      init_point: 'https://mp.sandbox.com/checkout',
    }),
  })),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2a$12$mockhash'),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: class MockRatelimit {
    constructor() {}
    static slidingWindow() { return {}; }
    async limit() {
      return { success: true, limit: 100, remaining: 99, reset: Date.now() + 60000 };
    }
  },
}));

jest.mock('@upstash/redis', () => ({
  Redis: jest.fn(() => ({})),
}));

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.MERCADO_PAGO_ACCESS_TOKEN = 'test-mp-token';
process.env.NEXT_PUBLIC_SITE_URL = 'https://test.descomplicai.com.br';
process.env.CRON_SECRET = 'test-cron-secret';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';

const { createMocks } = require('node-mocks-http');
global.createMocks = createMocks;
global.mockSupabase = mockSupabase;

beforeEach(() => {
  jest.clearAllMocks();
  const chain = mockSupabase._chain;
  Object.keys(chain).forEach((key) => {
    if (typeof chain[key] === 'function' && key !== 'auth') {
      chain[key].mockReturnThis();
    }
  });
  chain.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
  chain.maybeSingle.mockResolvedValue({ data: null, error: { message: 'not found' } });
  chain.rpc.mockResolvedValue({ data: [], error: null });
  chain.limit.mockResolvedValue({ data: [], error: null });

  mockSupabase.rpc.mockResolvedValue({ data: [], error: null });
  mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
  mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
});

afterEach(() => {
  jest.clearAllMocks();
});
