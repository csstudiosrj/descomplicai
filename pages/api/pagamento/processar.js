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

  const { token, issuer_id, payment_method_id, transaction_amount, installments, payer, preferenceId } = req.body;

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
        'X-Idempotency-Key': `${preferenceId}_${Date.now()}`,
      },
      body: JSON.stringify({
        token,
        issuer_id,
        payment_method_id,
        transaction_amount,
        installments,
        payer,
        external_reference: preferenceId,
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/pagamento/webhook`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[PROCESSAR] Erro MP:', data);
      return res.status(500).json({ error: 'Erro ao processar pagamento', detalhe: data.message });
    }

    // Atualiza o pagamento no banco
    await supabaseAdmin
      .from('pagamentos')
      .update({
        mp_payment_id: String(data.id),
        status: data.status === 'approved' ? 'aprovado' : 'pendente',
        atualizado_em: new Date().toISOString(),
      })
      .eq('mp_preference_id', preferenceId);

    return res.status(200).json({
      success: data.status === 'approved',
      paymentId: data.id,
      status: data.status,
    });
  } catch (err) {
    console.error('[PROCESSAR] Erro:', err);
    return res.status(500).json({ error: 'Erro ao processar pagamento', detalhe: err.message });
  }
}

export default withRateLimit(_handler, pagamentoLimiter);