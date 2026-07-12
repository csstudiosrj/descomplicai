import { withRateLimit, pagamentoLimiter } from '@/lib/rateLimit.js';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

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
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            title: titulo,
            quantity: 1,
            unit_price: preco,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: dadosEvento?.email || 'teste@email.com',
          name: `${dadosEvento?.nomes?.noiva || dadosEvento?.nomePessoa1 || 'Casal'} e ${dadosEvento?.nomes?.noivo || dadosEvento?.nomePessoa2 || ''}`,
        },
        external_reference: externalRef,
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/pagamento/webhook`,
        metadata: {
          usuarioId,
          eventoId,
          tipo,
          duracao_meses: isAssinatura ? (plano === 'mensal' ? 1 : parseInt(plano)) : 0,
        },
      },
    });

    await supabaseAdmin
      .from('pagamentos')
      .update({
        mp_preference_id: result.id,
        atualizado_em: new Date().toISOString(),
      })
      .eq('external_reference', externalRef);

    return res.status(200).json({
      success: true,
      preferenceId: result.id,
      publicKey: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
    });
  } catch (err) {
    console.error('[BRICKS] Erro:', err);
    return res.status(500).json({ error: 'Erro ao criar preferencia', detalhe: err.message });
  }
}

export default withRateLimit(_handler, pagamentoLimiter);