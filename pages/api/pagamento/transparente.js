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

  const {
    tipo,
    usuarioId,
    eventoId,
    dadosEvento,
    plano = 'basico',
    cardToken,
    paymentMethodId,
    installments = 1,
    issuerId,
  } = req.body;

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

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': externalRef,
      },
      body: JSON.stringify({
        transaction_amount: preco,
        token: cardToken,
        description: titulo,
        installments: parseInt(installments) || 1,
        payment_method_id: paymentMethodId,
        issuer_id: issuerId,
        payer: {
          email: dadosEvento?.email || 'teste@email.com',
          first_name: dadosEvento?.nomes?.noiva || dadosEvento?.nomePessoa1 || 'Casal',
          last_name: dadosEvento?.nomes?.noivo || dadosEvento?.nomePessoa2 || '',
        },
        external_reference: externalRef,
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/pagamento/webhook`,
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
      console.error('[TRANSPARENTE] Erro MP:', data);
      return res.status(500).json({ 
        error: 'Erro ao processar pagamento', 
        detalhe: data.message || data.error 
      });
    }

    // Atualiza o pagamento no banco
    await supabaseAdmin
      .from('pagamentos')
      .update({
        mp_payment_id: String(data.id),
        status: data.status === 'approved' ? 'aprovado' : 'pendente',
        atualizado_em: new Date().toISOString(),
      })
      .eq('external_reference', externalRef);

    return res.status(200).json({
      success: data.status === 'approved',
      paymentId: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      externalReference: externalRef,
    });
  } catch (err) {
    console.error('[TRANSPARENTE] Erro:', err);
    return res.status(500).json({ error: 'Erro ao processar pagamento', detalhe: err.message });
  }
}

export default withRateLimit(_handler, pagamentoLimiter);