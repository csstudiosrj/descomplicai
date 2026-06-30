import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

/**
 * POST /api/pagamento/criar
 * Body: { fornecedor_id, tipo: 'fornecedor', plano: 'basico' | 'premium' | 'vip' }
 * Cria preferencia de pagamento no Mercado Pago
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  const { fornecedor_id, tipo = 'fornecedor', plano = 'basico' } = req.body;

  if (!fornecedor_id) {
    return res.status(400).json({ error: 'fornecedor_id obrigatorio' });
  }

  if (tipo !== 'fornecedor') {
    return res.status(400).json({ error: 'Tipo nao suportado. Use tipo: "fornecedor"' });
  }

  // Busca fornecedor
  const { data: fornecedor, error: fErr } = await supabaseAdmin
    .from('fornecedores')
    .select('id, email, nome, valor_total')
    .eq('id', fornecedor_id)
    .single();

  if (fErr || !fornecedor) {
    return res.status(404).json({ error: 'Fornecedor nao encontrado' });
  }

  // Precos por plano (em reais)
  const precos = {
    basico: 49.90,
    premium: 99.90,
    vip: 199.90,
  };

  const preco = precos[plano] || precos.basico;

  const preference = new Preference(client);

  try {
    const result = await preference.create({
      body: {
        items: [
          {
            title: `Assinatura Descomplicai — Plano ${plano.charAt(0).toUpperCase() + plano.slice(1)}`,
            quantity: 1,
            unit_price: preco,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: fornecedor.email || 'nao-informado@descomplicai.com',
          name: fornecedor.nome || 'Fornecedor',
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/fornecedor/pagamento/sucesso`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/fornecedor/pagamento/erro`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/fornecedor/pagamento/pendente`,
        },
        auto_return: 'approved',
        external_reference: `fornecedor_${fornecedor_id}_plano_${plano}`,
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercado-pago`,
        metadata: {
          fornecedor_id,
          plano,
          tipo: 'assinatura_fornecedor',
        },
      },
    });

    // Salva referencia do pagamento (coluna mp_payment_id usada como preference_id)
    await supabaseAdmin.from('pagamentos').insert({
      fornecedor_id,
      tipo: 'assinatura',
      valor: preco,
      mp_payment_id: result.id,
      status: 'pendente',
      criado_em: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      init_point: result.init_point,
      preference_id: result.id,
    });
  } catch (err) {
    console.error('[PAGAMENTO] Erro Mercado Pago:', err);
    return res.status(500).json({ error: 'Erro ao criar pagamento', detalhe: err.message });
  }
}
