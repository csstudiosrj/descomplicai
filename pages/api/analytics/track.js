import { withRateLimit, analyticsLimiter } from "../../../lib/ratelimit";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { evento, propriedades, userId, sessionId } = req.body;

    if (!evento) {
      return res.status(400).json({ error: "Evento é obrigatório" });
    }

    // Inserir evento de analytics
    const { error } = await supabase.from("analytics_eventos").insert({
      evento,
      propriedades: propriedades || {},
      user_id: userId || null,
      session_id: sessionId || null,
      ip: req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || null,
      user_agent: req.headers["user-agent"] || null,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[Analytics] Erro:", error);
    return res.status(500).json({ error: "Erro ao registrar evento" });
  }
}

// Aplicar rate limit: 100 req/min por IP
export default withRateLimit(handler, analyticsLimiter);
