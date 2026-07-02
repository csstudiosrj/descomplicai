// lib/ratelimit.js
// Rate Limiting em memória — Descomplicaí
// Substitui Upstash Redis por Map nativo do JavaScript
// Limitação: em serverless, cada instância tem seu próprio contador
// Mas protege contra abuso em cada instância individual

// Mapa global de rate limits: { [key]: { count, resetAt } }
const store = new Map();

/**
 * Limpa entradas expiradas do store (a cada 1000 acessos)
 */
function cleanup() {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, data] of store) {
    if (data.resetAt < now) {
      store.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`[RateLimit] Cleanup: ${cleaned} entradas removidas`);
  }
}

let accessCount = 0;

/**
 * Cria um limiter em memória com janela deslizante simples
 * @param {number} maxRequests - Máximo de requisições por janela
 * @param {number} windowMs - Duração da janela em milissegundos
 * @param {string} prefix - Prefixo para identificação
 */
function createMemoryLimiter(maxRequests, windowMs, prefix) {
  return {
    async limit(identifier) {
      accessCount++;
      if (accessCount % 1000 === 0) cleanup();

      const key = `${prefix}:${identifier}`;
      const now = Date.now();
      const data = store.get(key);

      // Se não existe ou expirou, cria nova janela
      if (!data || data.resetAt < now) {
        store.set(key, {
          count: 1,
          resetAt: now + windowMs,
        });
        return {
          success: true,
          limit: maxRequests,
          remaining: maxRequests - 1,
          reset: now + windowMs,
        };
      }

      // Dentro da janela atual
      if (data.count >= maxRequests) {
        return {
          success: false,
          limit: maxRequests,
          remaining: 0,
          reset: data.resetAt,
        };
      }

      data.count++;
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - data.count,
        reset: data.resetAt,
      };
    },
  };
}

// === LIMITADORES (mesma API do Upstash) ===

export const cadastroLimiter = createMemoryLimiter(5, 60 * 1000, "descomplicai:rl:cadastro");
export const pagamentoLimiter = createMemoryLimiter(10, 60 * 1000, "descomplicai:rl:pagamento");
export const analyticsLimiter = createMemoryLimiter(100, 60 * 1000, "descomplicai:rl:analytics");
export const conviteLimiter = createMemoryLimiter(10, 60 * 1000, "descomplicai:rl:convite");
export const strictLimiter = createMemoryLimiter(5, 60 * 1000, "descomplicai:rl:strict");

/**
 * Wrapper reutilizável — mesma API do original
 */
export function withRateLimit(handler, limiter, getIdentifier = null) {
  return async function rateLimitedHandler(req, res) {
    try {
      const identifier = getIdentifier
        ? getIdentifier(req)
        : req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
          || req.socket?.remoteAddress
          || "anonymous";

      const { success, limit, remaining, reset } = await limiter.limit(identifier);

      res.setHeader("X-RateLimit-Limit", String(limit));
      res.setHeader("X-RateLimit-Remaining", String(remaining));
      res.setHeader("X-RateLimit-Reset", String(reset));

      if (!success) {
        return res.status(429).json({
          error: "Muitas requisições. Tente novamente em alguns minutos.",
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        });
      }

      return handler(req, res);
    } catch (error) {
      console.error("[RateLimit] Erro:", error);
      return handler(req, res);
    }
  };
}