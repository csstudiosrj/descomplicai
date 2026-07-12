import { withRateLimit, pagamentoLimiter } from '@/lib/rateLimit.js';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function _handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  const { tipo, usuarioId, eventoId, dadosEvento, plano = 'basico' } = req.body;

  if (!tipo || !usuarioId || !eventoId) {
    return res.status(400).json({ error: 'tipo, usuarioId e eventoId obrigatorios' });
  }

  const isAssinatura = tipo === 'assinatura';
  const preco = isAssinatura ? 29.90 : 197.00;
  const titulo = isAssinatura
    ? `Assinatura Descomplicai — ${plano.replace('_', ' ')}`
    : 'Memorial Personalizado — Descomplicai';

  const externalRef = `descomplicai_${eventoId}_${tipo}_${Date.now()}`;

  // Salva no banco antes de criar no MP
  await supabaseAdmin.from('pagamentos').insert({
    usuario_id: usuarioId,
    evento_id: eventoId,
    tipo: isAssinatura ? 'assinatura' : 'memorial_pdf',
    valor: preco,
    status: 'pendente',
    duracao_meses: isAssinatura ? (plano === 'mensal' ? 1 : parseInt(plano)) : null,
    external_reference: externalRef,
    criado_em: new Date().toISOString(),
  });

  try {
    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken) {
      return res.status(500).json({ error: 'MP_ACCESS_TOKEN nao configurado' });
    }

    // Cria link de pagamento dinâmico via API do MP
    const response = await fetch('https://api.mercadopago.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': externalRef,
      },
      body: JSON.stringify({
        title: titulo,
        description: titulo,
        unit_price: preco,
        quantity: 1,
        currency_id: 'BRL',
        external_reference: externalRef,
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/pagamento/webhook`,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/memorial/conclusao?pagamento=sucesso&tipo=${tipo}`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/memorial/conclusao?pagamento=erro&tipo=${tipo}`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/memorial/conclusao?pagamento=pendente&tipo=${tipo}`,
        },
        payer: {
          email: dadosEvento?.email || 'teste@email.com',
        },
        metadata: {
          usuarioId,
          eventoId,
          tipo,
          duracao_meses: isAssinatura ? (plano === 'mensal' ? 1 : parseInt(plano)) : 0,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[LINK] Erro MP:', data);
      return res.status(500).json({ error: 'Erro ao criar link de pagamento', detalhe: data.message });
    }

    // Atualiza com o ID do link
    await supabaseAdmin
      .from('pagamentos')
      .update({
        mp_preference_id: data.id,
        atualizado_em: new Date().toISOString(),
      })
      .eq('external_reference', externalRef);

    return res.status(200).json({
      success: true,
      checkoutUrl: data.init_point,
      externalReference: externalRef,
    });
  } catch (err) {
    console.error('[LINK] Erro:', err);
    return res.status(500).json({ error: 'Erro ao criar link de pagamento', detalhe: err.message });
  }
}

export default withRateLimit(_handler, pagamentoLimiter);