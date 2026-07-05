import { withRateLimit, pagamentoLimiter } from '@/lib/rateLimit.js';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN,
});

// ─── PREÇOS DO CASAL ───
const PRECO_PDF = 197.00;
const PRECO_ASSINATURA_MENSAL = 29.90;

// ─── PREÇOS DO FORNECEDOR ───
const PRECO_FORNECEDOR = {
  basico: 49.90,
  premium: 99.90,
  vip: 199.90,
};

// ─── DURAÇÃO DOS PLANOS DE ASSINATURA (meses) ───
const DURACAO_PLANOS = {
  mensal: 1,
  '3_meses': 3,
  '6_meses': 6,
  '12_meses': 12,
  '18_meses': 18,
};

/**
 * POST /api/pagamento/criar
 * 
 * Tipos suportados:
 * - memorial_pdf: { tipo, usuarioId, eventoId, dadosEvento }
 * - assinatura:   { tipo, plano, usuarioId, eventoId, dadosEvento }
 * - fornecedor:   { tipo, fornecedor_id, plano }
 */
async function _handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  const {
    tipo,
    usuarioId,
    eventoId,
    dadosEvento,
    fornecedor_id,
    plano = 'basico',
  } = req.body;

  if (!tipo) {
    return res.status(400).json({ error: 'tipo obrigatorio (memorial_pdf, assinatura, fornecedor)' });
  }

  // ───────────────────────────────────────────────
  // FLUXO DO CASAL: memorial_pdf ou assinatura
  // ───────────────────────────────────────────────
  if (tipo === 'memorial_pdf' || tipo === 'assinatura') {
    if (!usuarioId || !eventoId) {
      return res.status(400).json({ error: 'usuarioId e eventoId obrigatorios' });
    }

    const isAssinatura = tipo === 'assinatura';
    const duracaoMeses = isAssinatura ? (DURACAO_PLANOS[plano] || 1) : 0;
    const preco = isAssinatura ? PRECO_ASSINATURA_MENSAL : PRECO_PDF;
    const titulo = isAssinatura
      ? `Assinatura Descomplicai — ${plano.replace('_', ' ')}`
      : 'Memorial Personalizado — Descomplicai';

    const externalRef = JSON.stringify({
      usuarioId,
      eventoId,
      tipo,
      duracao_meses: duracaoMeses,
    });

    const preference = new Preference(client);

    try {
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
            email: dadosEvento?.email || 'nao-informado@descomplicai.com',
            name: dadosEvento?.nomes?.noiva || dadosEvento?.nomes?.noivo || 'Casal',
          },
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_SITE_URL}/memorial/conclusao?pagamento=sucesso&tipo=${tipo}`,
            failure: `${process.env.NEXT_PUBLIC_SITE_URL}/memorial/conclusao?pagamento=erro&tipo=${tipo}`,
            pending: `${process.env.NEXT_PUBLIC_SITE_URL}/memorial/conclusao?pagamento=pendente&tipo=${tipo}`,
          },
          auto_return: 'approved',
          external_reference: externalRef,
          notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/pagamento/webhook`,
          metadata: {
            usuarioId,
            eventoId,
            tipo,
            duracao_meses: duracaoMeses,
          },
        },
      });

      // Salva referencia do pagamento
      await supabaseAdmin.from('pagamentos').insert({
        usuario_id: usuarioId,
        evento_id: eventoId,
        tipo: isAssinatura ? 'assinatura' : 'memorial_pdf',
        valor: preco,
        mp_payment_id: result.id,
        status: 'pendente',
        duracao_meses: duracaoMeses || null,
        criado_em: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        checkoutUrl: result.init_point,
        init_point: result.init_point,
        preference_id: result.id,
      });
    } catch (err) {
      console.error('[PAGAMENTO CASAL] Erro Mercado Pago:', err);
      return res.status(500).json({ error: 'Erro ao criar pagamento', detalhe: err.message });
    }
  }

  // ───────────────────────────────────────────────
  // FLUXO DO FORNECEDOR (mantido intacto)
  // ───────────────────────────────────────────────
  if (tipo === 'fornecedor') {
    if (!fornecedor_id) {
      return res.status(400).json({ error: 'fornecedor_id obrigatorio' });
    }

    const { data: fornecedor, error: fErr } = await supabaseAdmin
      .from('fornecedores')
      .select('id, email, nome, valor_total')
      .eq('id', fornecedor_id)
      .single();

    if (fErr || !fornecedor) {
      return res.status(404).json({ error: 'Fornecedor nao encontrado' });
    }

    const preco = PRECO_FORNECEDOR[plano] || PRECO_FORNECEDOR.basico;

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
        checkoutUrl: result.init_point,
        init_point: result.init_point,
        preference_id: result.id,
      });
    } catch (err) {
      console.error('[PAGAMENTO FORNECEDOR] Erro Mercado Pago:', err);
      return res.status(500).json({ error: 'Erro ao criar pagamento', detalhe: err.message });
    }
  }

  // Tipo desconhecido
  return res.status(400).json({
    error: 'Tipo nao suportado',
    tipos_suportados: ['memorial_pdf', 'assinatura', 'fornecedor'],
  });
}

export default withRateLimit(_handler, pagamentoLimiter);