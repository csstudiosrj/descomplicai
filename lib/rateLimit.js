// Rate limit simples em memória — funciona com Turbopack, zero dependências
const requests = new Map();

function cleanupOldEntries(windowMs) {
  const now = Date.now();
  const cutoff = now - (windowMs * 2);
  let cleaned = 0;
  for (const [key, data] of requests) {
    if (data.resetTime < cutoff) {
      requests.delete(key);
      cleaned++;
    }
  }
  if (requests.size > 1000 && cleaned === 0) {
    const entries = Array.from(requests.entries());
    entries.sort((a, b) => a[1].resetTime - b[1].resetTime);
    const toDelete = entries.slice(0, Math.floor(entries.length / 2));
    for (const [key] of toDelete) requests.delete(key);
  }
}

export function rateLimit(identifier, limit = 10, windowMs = 60000) {
  const now = Date.now();
  cleanupOldEntries(windowMs);
  
  const key = `${identifier}:${Math.floor(now / windowMs)}`;
  const data = requests.get(key);
  
  if (!data) {
    requests.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }
  
  if (data.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: data.resetTime };
  }
  
  data.count++;
  return { allowed: true, remaining: limit - data.count, resetTime: data.resetTime };
}

export function withRateLimit(handler, options = {}) {
  const { limit = 10, windowMs = 60000, identifierFn = (req) => req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown' } = options;
  
  return async function rateLimitedHandler(req, res) {
    const identifier = identifierFn(req);
    const result = rateLimit(identifier, limit, windowMs);
    
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, result.remaining));
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
    
    if (!result.allowed) {
      return res.status(429).json({ 
        error: 'Too many requests', 
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000) 
      });
    }
    
    return handler(req, res);
  };
}

// Limiters pré-configurados (compatibilidade com imports antigos)
export const strictLimiter = { limit: 30, windowMs: 60000 };
export const pagamentoLimiter = { limit: 10, windowMs: 60000 };
export const conviteLimiter = { limit: 5, windowMs: 60000 };
export const cadastroLimiter = { limit: 5, windowMs: 60000 };

export const analyticsLimiter = { limit: 100, windowMs: 60000 };
