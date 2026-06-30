import { withRateLimit, conviteLimiter } from "../../../lib/ratelimit";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { token } = req.method === "GET" ? req.query : req.body;

    if (!token) {
      return res.status(400).json({ error: "Token é obrigatório" });
    }

    // Buscar convite pelo token
    const { data: convite, error } = await supabase
      .from("convites")
      .select("*, eventos(*)")
      .eq("token", token)
      .single();

    if (error || !convite) {
      return res.status(404).json({ error: "Convite não encontrado" });
    }

    // Verificar se convite expirou
    if (convite.expira_em && new Date(convite.expira_em) < new Date()) {
      return res.status(410).json({ error: "Convite expirado" });
    }

    // Verificar se convite já foi usado
    if (convite.usado_em) {
      return res.status(409).json({ error: "Convite já foi utilizado" });
    }

    return res.status(200).json({
      valido: true,
      convite: {
        id: convite.id,
        eventoId: convite.evento_id,
        nomeEvento: convite.eventos?.nome,
        tipo: convite.tipo,
        expiraEm: convite.expira_em,
      },
    });
  } catch (error) {
    console.error("[Validar Convite] Erro:", error);
    return res.status(500).json({ error: "Erro ao validar convite" });
  }
}

// Aplicar rate limit: 10 req/min por IP
export default withRateLimit(handler, conviteLimiter);
