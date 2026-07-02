import { createClient } from "@supabase/supabase-js";

/**
 * Loga um erro no Sentry (se disponível) ou no Supabase (fallback)
 * @param {Error} error - Objeto de erro
 * @param {Object} context - Contexto adicional (req, userId, etc.)
 */
export async function logError(error, context = {}) {
  const { req, userId, extra = {} } = context;

  // Tentar Sentry primeiro
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (dsn) {
          if (req?.url) scope.setTag("url", req.url);
      if (req?.method) scope.setTag("method", req.method);

      Object.entries(extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });

          });
    return;
  }

  // Fallback: log no Supabase
  await logToSupabase({
    tipo: extra.tipo || "api_error",
    mensagem: error.message,
    stack: error.stack,
    url: req?.url,
    method: req?.method,
    userId,
    statusCode: extra.statusCode,
    userAgent: req?.headers?.["user-agent"],
    ip: req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim(),
  });
}

/**
 * Loga erro no Supabase (tabela `erros`)
 */
async function logToSupabase({ tipo, mensagem, stack, url, method, userId, statusCode, userAgent, ip }) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    await supabase.from("erros").insert({
      tipo: tipo || "unknown",
      mensagem: mensagem?.substring(0, 1000),
      stack: stack?.substring(0, 4000),
      url: url?.substring(0, 500),
      method: method?.substring(0, 10),
      user_id: userId || null,
      status_code: statusCode || null,
      user_agent: userAgent?.substring(0, 500),
      ip: ip?.substring(0, 45),
      ambiente: process.env.NODE_ENV,
      created_at: new Date().toISOString(),
    });
  } catch (e) {
    // Último recurso: console
    console.error("[ErrorLogger] Falha crítica ao logar erro:", e.message);
    console.error("Erro original:", mensagem);
  }
}

/**
 * Wrapper para handlers de API que captura erros automaticamente
 * @param {Function} handler - Handler da API route
 */
export function withErrorCapture(handler) {
  return async function errorCapturedHandler(req, res) {
    try {
      return await handler(req, res);
    } catch (error) {
      await logError(error, {
        req,
        extra: { tipo: "api_error", statusCode: 500 },
      });

      return res.status(500).json({
        error: "Erro interno do servidor",
        requestId: error.requestId || undefined,
      });
    }
  };
}
