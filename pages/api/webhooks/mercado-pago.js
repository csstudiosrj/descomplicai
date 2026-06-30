import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { enviarEmailTemplate } from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

/**
 * POST /api/webhooks/mercado-pago
 * Recebe notificações do Mercado Pago (IPN / Webhook)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Mercado Pago envia query params: type, data.id
  const { type, 'data.id': dataId } = req.query;
  const { action, data: bodyData } = req.body;

  // Aceita tanto query params (IPN) quanto body (webhook)
  const paymentId = dataId || bodyData?.id;
  const eventType = type || action;

  if (!paymentId) {
    return res.status(400).json({ error: 'ID do pagamento não encontrado' });
  }

  // Confirma pagamento na API do Mercado Pago
  try {
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    const status = paymentData.status; // approved, pending, rejected, etc.
    const externalRef = paymentData.external_reference;
    const metadata = paymentData.metadata || {};

    // Extrai fornecedor_id do external_reference
    const fornecedorId = metadata.fornecedor_id || 
      (externalRef ? externalRef.match(/fornecedor_(.+?)_/)?.[1] : null);

    if (!fornecedorId) {
      return res.status(400).json({ error: 'fornecedor_id não encontrado no pagamento' });
    }

    // Atualiza pagamento no banco
    await supabaseAdmin
      .from('pagamentos')
      .update({
        status: status === 'approved' ? 'pago' : status === 'pending' ? 'pendente' : 'falhou',
        mp_payment_id: String(paymentId),
        atualizado_em: new Date().toISOString(),
      })
      .eq('mp_preference_id', paymentData.preference_id);

    // Se pagamento aprovado, atualiza fornecedor
    if (status === 'approved') {
      const { data: fornecedor } = await supabaseAdmin
        .from('fornecedores')
        .select('id, email, nome_fantasia, status')
        .eq('id', fornecedorId)
        .single();

      if (fornecedor && fornecedor.status !== 'aprovado') {
        // Atualiza status para ativo (aguarda aprovação do admin para 'aprovado')
        await supabaseAdmin
          .from('fornecedores')
          .update({
            pagamento_status: 'pago',
            status: 'ativo', // pago, mas ainda precisa de aprovação do admin
            updated_at: new Date().toISOString(),
          })
          .eq('id', fornecedorId);

        // Envia e-mail confirmando pagamento
        await enviarEmailTemplate(
          {
            para: fornecedor.email,
            template: 'pagamento_confirmado',
            variaveis: {
              nome_fantasia: fornecedor.nome_fantasia,
              link_painel: `${process.env.NEXT_PUBLIC_SITE_URL}/fornecedor/painel`,
            },
          },
          supabaseAdmin
        );
      }
    }

    return res.status(200).json({ success: true, status, fornecedor_id: fornecedorId });
  } catch (err) {
    console.error('[WEBHOOK] Erro:', err);
    return res.status(500).json({ error: 'Erro ao processar webhook', detalhe: err.message });
  }
}
