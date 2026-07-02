import { withRateLimit, analyticsLimiter } from '@/lib/rateLimit.js';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo nao permitido" });
  }

  try {
    const body = req.body;

    // Suporta tanto evento unico quanto batch
    const eventos = body.batch || [body];

    if (!Array.isArray(eventos) || eventos.length === 0) {
      return res.status(400).json({ error: "Evento(s) obrigatorio(s)" });
    }

    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || null;
    const userAgent = req.headers["user-agent"] || null;
    const timestamp = new Date().toISOString();

    // Prepara inserts em batch
    const inserts = eventos.map((evt) => ({
      evento_tipo: evt.evento_tipo || evt.evento || 'pageview',
      categoria: evt.categoria || null,
      acao: evt.acao || null,
      pagina: evt.pagina || null,
      step_id: evt.step_id || null,
      usuario_id: evt.usuario_id || evt.userId || null,
      evento_id: evt.evento_id || null,
      fornecedor_id: evt.fornecedor_id || null,
      valor: evt.valor || null,
      dados: evt.dados || evt.propriedades || null,
      sessao_id: evt.sessao_id || evt.sessionId || `srv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_agent: userAgent,
      ip,
      origem: 'client',
      criado_em: timestamp,
    }));

    // Insere em batch (1 write para N eventos)
    const { error } = await supabase.from("analytics_eventos").insert(inserts);

    if (error) throw error;

    return res.status(200).json({ success: true, inseridos: inserts.length });
  } catch (error) {
    console.error("[Analytics] Erro:", error);
    return res.status(500).json({ error: "Erro ao registrar evento" });
  }
}

export default withRateLimit(handler, analyticsLimiter);
