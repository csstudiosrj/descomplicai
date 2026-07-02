import { withRateLimit, analyticsLimiter } from '@/lib/rateLimit.js';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  }
);

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo nao permitido" });
  }

  try {
    const body = req.body;
    console.log("[DEBUG] Body recebido:", JSON.stringify(body));

    const eventos = body.batch || [body];
    console.log("[DEBUG] Eventos:", JSON.stringify(eventos));

    if (!Array.isArray(eventos) || eventos.length === 0) {
      return res.status(400).json({ error: "Evento(s) obrigatorio(s)" });
    }

    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || null;
    const userAgent = req.headers["user-agent"] || null;
    const timestamp = new Date().toISOString();

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

    console.log("[DEBUG] Inserts:", JSON.stringify(inserts));

    const { data, error } = await supabase.from("analytics_eventos").insert(inserts).select();

    if (error) {
      console.error("[DEBUG] Supabase error:", JSON.stringify(error));
      throw error;
    }

    console.log("[DEBUG] Insert OK:", JSON.stringify(data));
    return res.status(200).json({ success: true, inseridos: inserts.length });
  } catch (error) {
    console.error("[DEBUG] Catch error:", error);
    console.error("[DEBUG] Error message:", error.message);
    console.error("[DEBUG] Error code:", error.code);
    return res.status(500).json({ 
      error: "Erro ao registrar evento",
      debug: error.message,
      code: error.code 
    });
  }
}

export default withRateLimit(handler, analyticsLimiter);