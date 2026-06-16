// pages/api/pagamento/criar.js
import { client, Preference } from '../../../lib/mercadopago';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Metodo nao permitido' });
  }

  const { tipo, usuarioId, eventoId } = req.body;

  if (!tipo) {
    return res.status(400).json({ erro: 'Tipo de pagamento nao informado' });
  }

  if (!usuarioId || !eventoId) {
    return res.status(400).json({ erro: 'usuarioId e eventoId sao obrigatorios' });
  }

  const itens = {
    memorial_pdf: {
      title: 'Memorial do Casamento — PDF Completo',
      quantity: 1,
      unit_price: 197,
      currency_id: 'BRL',
    },
    assinatura: {
      title: 'Descomplicai — Plano Mensal',
      quantity: 1,
      unit_price: 29.9,
      currency_id: 'BRL',
    },
  };

  const item = itens[tipo];
  if (!item) {
    return res.status(400).json({ erro: 'Tipo de pagamento invalido' });
  }

  try {
    const preference = new Preference(client);
    const resultado = await preference.create({
      body: {
        items: [item],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/memorial/conclusao?pagamento=sucesso&tipo=${tipo}&concluido=1`,
          failure: `${process.env.NEXT_PUBLIC_URL}/memorial/conclusao?pagamento=erro&concluido=1`,
          pending: `${process.env.NEXT_PUBLIC_URL}/memorial/conclusao?pagamento=pendente&concluido=1`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/pagamento/webhook`,
        // CORRECAO CRITICA: external_reference para o webhook identificar o pagamento
        external_reference: JSON.stringify({ usuarioId, eventoId, tipo }),
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