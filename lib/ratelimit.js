import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate Limiting - Descomplicaí
 * 
 * Algoritmos disponíveis:
 * - slidingWindow: Melhor equilíbrio entre precisão e performance. 
 *   Evita bursts nos limites da janela. Recomendado para APIs gerais.
 * - fixedWindow: Mais barato computacionalmente, mas permite 2x burst nos limites.
 *   Bom para throttling simples (login, etc).
 * - tokenBucket: Permite bursts controlados. Útil para tráfego irregular.
 *   Mais caro computacionalmente.
 * 
 * Para produção (single-region Vercel), slidingWindow é o melhor default.
 * Ref: https://upstash.com/docs/redis/sdks/ratelimit-ts/algorithms
 */

// Redis client usando variáveis de ambiente
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Limitador para cadastros: 5 req/min por IP
// slidingWindow evita que um usuário faça 5 reqs no final de uma janela
// e mais 5 no início da próxima (problema do fixedWindow)
export const cadastroLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "descomplicai:rl:cadastro",
});

// Limitador para pagamentos: 10 req/min por IP
export const pagamentoLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "descomplicai:rl:pagamento",
});

// Limitador para analytics: 100 req/min por IP
export const analyticsLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "60 s"),
  analytics: true,
  prefix: "descomplicai:rl:analytics",
});

// Limitador para convites: 10 req/min por IP
export const conviteLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "descomplicai:rl:convite",
});

// Limitador genérico estrito: 5 req/min
export const strictLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "descomplicai:rl:strict",
});

/**
 * Wrapper reutilizável para aplicar rate limit em API routes do Pages Router
 * @param {Function} handler - Handler original da API route
 * @param {Ratelimit} limiter - Instância do Ratelimit
 * @param {Function} getIdentifier - Função para extrair identificador (default: IP)
 */
export function withRateLimit(handler, limiter, getIdentifier = null) {
  return async function rateLimitedHandler(req, res) {
    try {
      // Extrair IP do request
      // Vercel: x-forwarded-for contém o IP real do cliente
      // Fallback: remoteAddress do socket
      const identifier = getIdentifier 
        ? getIdentifier(req) 
        : req.headers["x-forwarded-for"]?.split(",")[0]?.trim() 
          || req.socket?.remoteAddress 
          || "anonymous";

      const { success, limit, remaining, reset } = await limiter.limit(identifier);

      // Sempre adicionar headers de rate limit (RFC 6585)
      res.setHeader("X-RateLimit-Limit", String(limit));
      res.setHeader("X-RateLimit-Remaining", String(remaining));
      res.setHeader("X-RateLimit-Reset", String(reset));

      if (!success) {
        return res.status(429).json({
          error: "Muitas requisições. Tente novamente em alguns minutos.",
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        });
      }

      // Prosseguir com o handler original
      return handler(req, res);
    } catch (error) {
      console.error("[RateLimit] Erro ao aplicar rate limit:", error);
      // Em caso de falha do Redis, permitir a requisição (fail-open)
      // Isso evita que o site fique fora do ar se o Redis cair
      return handler(req, res);
    }
  };
}
