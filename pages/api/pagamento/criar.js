import { client, Preference } from '../../../lib/mercadopago';
import { supabase } from '../../../lib/supabase';
import { trackServerEvent } from '../../../utils/trackServerEvent';

const PLANOS = {
  mensal: { duracao_meses: 1, preco: 29.9, titulo: 'Descomplicaí — Plano Mensal' },
  '3_meses': { duracao_meses: 3, preco: 79.9, titulo: 'Descomplicaí — Plano 3 Meses' },
  '6_meses': { duracao_meses: 6, preco: 149.9, titulo: 'Descomplicaí — Plano 6 Meses' },
  '12_meses': { duracao_meses: 12, preco: 249.9, titulo: 'Descomplicaí — Plano 12 Meses' },
  '18_meses': { duracao_meses: 18, preco: 349.9, titulo: 'Descomplicaí — Plano 18 Meses' },
};

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }

  try {
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
    let valor = 0;

    if (tipo === 'memorial_pdf') {
      valor = 197;
      item = {
        title: 'Memorial do Casamento — PDF Completo',
        quantity: 1,
        unit_price: valor,
        currency_id: 'BRL',
      };
      metadata = { duracao_meses: 0 };
    } else if (tipo === 'assinatura') {
      const planoConfig = PLANOS[plano || 'mensal'];
      if (!planoConfig) {
        return res.status(400).json({ erro: 'Plano de assinatura invalido' });
      }
      valor = planoConfig.preco;
      item = {
        title: planoConfig.titulo,
        quantity: 1,
        unit_price: valor,
        currency_id: 'BRL',
      };
      duracaoMeses = planoConfig.duracao_meses;
      metadata = { duracao_meses: duracaoMeses };
    } else {
      return res.status(400).json({ erro: 'Tipo de pagamento invalido' });
    }

    // Track analytics
    await trackServerEvent({
      tipo: 'checkout',
      categoria: 'pagamento',
      acao: 'iniciou',
      valor,
      usuario_id: user.id,
      evento_id: eventoId,
      req,
    });

    const externalReference = JSON.stringify({ usuarioId, eventoId, tipo, duracao_meses: duracaoMeses });
    console.log('Criar preference: external_reference =', externalReference);

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
        external_reference: externalReference,
      },
    });

    res.status(200).json({
      sucesso: true,
      checkoutUrl: resultado.init_point,
      preferenceId: resultado.id,
    });
  } catch (error) {
    console.error('Erro em pagamento/criar:', error.message);
    return res.status(500).json({
      erro: 'Erro interno do servidor. Tente novamente.',
    });
  }
}
