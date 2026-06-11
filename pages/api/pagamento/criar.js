// pages/api/pagamento/criar.js (versão de teste — sem Supabase)
import { client, Preference } from '../../../lib/mercadopago';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { tipo } = req.body;

  if (!tipo) {
    return res.status(400).json({ erro: 'Tipo de pagamento não informado' });
  }

  const itens = {
    memorial_pdf: {
      title: 'Memorial do Casamento — PDF Completo',
      quantity: 1,
      unit_price: 197,
      currency_id: 'BRL',
    },
    assinatura: {
      title: 'Descomplicaí — Plano Mensal',
      quantity: 1,
      unit_price: 29.9,
      currency_id: 'BRL',
    },
  };

  const item = itens[tipo];
  if (!item) {
    return res.status(400).json({ erro: 'Tipo de pagamento inválido' });
  }

  try {
    const preference = new Preference(client);
    const resultado = await preference.create({
      body: {
        items: [item],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/memorial/conclusao?pagamento=sucesso&tipo=${tipo}`,
          failure: `${process.env.NEXT_PUBLIC_URL}/memorial/conclusao?pagamento=erro`,
          pending: `${process.env.NEXT_PUBLIC_URL}/memorial/conclusao?pagamento=pendente`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/pagamento/webhook`,
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