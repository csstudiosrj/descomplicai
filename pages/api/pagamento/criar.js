// pages/api/pagamento/criar.js
import { client, Preference } from '../../../lib/mercadopago';

const PLANOS = {
  mensal: { duracao_meses: 1, preco: 29.9, titulo: 'Descomplicai — Plano Mensal' },
  '3_meses': { duracao_meses: 3, preco: 79.9, titulo: 'Descomplicai — Plano 3 Meses' },
  '6_meses': { duracao_meses: 6, preco: 149.9, titulo: 'Descomplicai — Plano 6 Meses' },
  '12_meses': { duracao_meses: 12, preco: 249.9, titulo: 'Descomplicai — Plano 12 Meses' },
  '18_meses': { duracao_meses: 18, preco: 349.9, titulo: 'Descomplicai — Plano 18 Meses' },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Metodo nao permitido' });
  }

  const { tipo, usuarioId, eventoId, plano } = req.body;

  if (!tipo) {
    return res.status(400).json({ erro: 'Tipo de pagamento nao informado' });
  }

  if (!usuarioId || !eventoId) {
    return res.status(400).json({ erro: 'usuarioId e eventoId sao obrigatorios' });
  }

  let item;
  let duracaoMeses = 0;
  let metadata = {};

  if (tipo === 'memorial_pdf') {
    item = {
      title: 'Memorial do Casamento — PDF Completo',
      quantity: 1,
      unit_price: 197,
      currency_id: 'BRL',
    };
    metadata = { duracao_meses: 0 };
  } else if (tipo === 'assinatura') {
    const planoConfig = PLANOS[plano || 'mensal'];
    if (!planoConfig) {
      return res.status(400).json({ erro: 'Plano de assinatura invalido' });
    }
    item = {
      title: planoConfig.titulo,
      quantity: 1,
      unit_price: planoConfig.preco,
      currency_id: 'BRL',
    };
    duracaoMeses = planoConfig.duracao_meses;
    metadata = { duracao_meses: duracaoMeses };
  } else {
    return res.status(400).json({ erro: 'Tipo de pagamento invalido' });
  }

  try {
    const preference = new Preference(client);
    const resultado = await preference.create({
      body: {
        items: [item],
        metadata,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/memorial/conclusao?pagamento=sucesso&tipo=${tipo}&concluido=1`,
          failure: `${process.env.NEXT_PUBLIC_URL}/memorial/conclusao?pagamento=erro&concluido=1`,
          pending: `${process.env.NEXT_PUBLIC_URL}/memorial/conclusao?pagamento=pendente&concluido=1`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/pagamento/webhook`,
        external_reference: JSON.stringify({ usuarioId, eventoId, tipo, duracao_meses: duracaoMeses }),
      },
    });

    res.status(200).json({
      sucesso: true,
      checkoutUrl: resultado.init_point,
      preferenceId: resultado.id,
    });
  } catch (erro) {
    console.error('Erro Mercado Pago:', erro);
    res.status(500).json({ erro: 'Erro ao criar pagamento', detalhe: erro.message });
  }
}
