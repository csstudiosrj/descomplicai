// pages/api/pagamento/webhook.js
import { client, Payment } from '../../../lib/mercadopago';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { type, data } = req.body;
  if (type !== 'payment') return res.status(200).end();

  try {
    const payment = new Payment(client);
    const pagamento = await payment.get({ id: data.id });

    if (pagamento.status !== 'approved') return res.status(200).end();

    const { usuarioId, eventoId, tipo } = JSON.parse(pagamento.external_reference);

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Registrar pagamento no historico
    await supabaseAdmin.from('pagamentos').insert({
      usuario_id: usuarioId,
      evento_id: eventoId,
      tipo,
      valor: pagamento.transaction_amount,
      status: 'aprovado',
      mp_payment_id: String(pagamento.id),
    });

    // CORRECAO: cada produto ativa sua propria flag, SEM misturar
    if (tipo === 'assinatura') {
      await supabaseAdmin
        .from('eventos')
        .update({ assinatura_ativa: true })
        .eq('id', eventoId);
    } else if (tipo === 'memorial_pdf') {
      await supabaseAdmin
        .from('eventos')
        .update({ plano: 'pdf' })
        .eq('id', eventoId);
    }

    res.status(200).end();
  } catch (erro) {
    console.error('Webhook erro:', erro);
    res.status(500).end();
  }
}