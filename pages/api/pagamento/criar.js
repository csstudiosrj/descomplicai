import { withRateLimit, pagamentoLimiter } from "../../../lib/ratelimit";
import { createClient } from "@supabase/supabase-js";

// Configurar Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { eventoId, valor, descricao } = req.body;

    if (!eventoId || !valor || !descricao) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    // Criar preferência de pagamento no Mercado Pago
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{
          title: descricao,
          quantity: 1,
          unit_price: Number(valor),
          currency_id: "BRL",
        }],
        external_reference: eventoId,
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/pagamento/webhook`,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/painel/financeiro?status=success`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/painel/financeiro?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/painel/financeiro?status=pending`,
        },
        auto_return: "approved",
      }),
    });

    const preference = await mpResponse.json();

    if (!mpResponse.ok) {
      throw new Error(preference.message || "Erro ao criar preferência");
    }

    // Salvar no banco
    const { data, error } = await supabase
      .from("pagamentos")
      .insert({
        evento_id: eventoId,
        valor,
        descricao,
        mp_preference_id: preference.id,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      pagamento: data,
    });
  } catch (error) {
    console.error("[Pagamento] Erro:", error);
    return res.status(500).json({ error: "Erro ao processar pagamento" });
  }
}

// Aplicar rate limit: 10 req/min por IP
export default withRateLimit(handler, pagamentoLimiter);
