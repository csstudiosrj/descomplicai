// pages/api/pagamento/criar.js
import { client, Preference } from '../../../lib/mercadopago';
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { tipo, dadosEvento } = req.body;

  if (!tipo || !dadosEvento) {
    return res.status(400).json({ erro: 'Dados insuficientes (tipo e dadosEvento obrigatórios)' });
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
    // Garante que exista um evento e um usuário no banco antes de gerar o pagamento
    const { usuarioId, eventoId } = await garantirEventoEUsuario(dadosEvento);

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
        external_reference: JSON.stringify({ usuarioId, eventoId, tipo }),
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

// Função interna que cria ou recupera o usuário e evento no Supabase.
// Utiliza a service key para escrita no banco.
async function garantirEventoEUsuario(dadosEvento) {
  // Usa o cliente com a service key para ter permissão de escrita
  const serviceClient = createServiceClient();
  const { email, nomePessoa1, nomePessoa2, ...resto } = dadosEvento;

  // 1. Obter ou criar usuário (baseado no email, se existir)
  let usuarioId = null;
  if (email) {
    // Busca usuário por email (assume que a autenticação já criou o registro)
    const { data: usuarioExistente } = await serviceClient
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (usuarioExistente) {
      usuarioId = usuarioExistente.id;
    } else {
      // Cria usuário sem senha (apenas registro administrativo)
      const { data: novoUsuario } = await serviceClient
        .from('usuarios')
        .insert({ email, nome: nomePessoa1 || email, tipo: 'casal' })
        .select('id')
        .single();
      usuarioId = novoUsuario?.id;
    }
  }

  // Se não tem email (usuário anônimo), cria um placeholder
  if (!usuarioId) {
    const { data: anonimo } = await serviceClient
      .from('usuarios')
      .insert({ email: `anonimo_${Date.now()}@descomplicai.com`, nome: 'Usuário anônimo', tipo: 'casal' })
      .select('id')
      .single();
    usuarioId = anonimo?.id;
  }

  // 2. Criar evento vinculado ao usuário
  const { data: evento } = await serviceClient
    .from('eventos')
    .insert({
      usuario_id: usuarioId,
      nome_evento: `${nomePessoa1 || 'Noivo'} & ${nomePessoa2 || 'Noiva'}`,
      data_evento: dadosEvento.dataEvento || null,
      status: 'rascunho',
      plano: 'gratuito',
      assinatura_ativa: false,
    })
    .select('id')
    .single();

  if (!evento) throw new Error('Falha ao criar evento');

  // 3. Salvar memorial no banco
  await serviceClient.from('memorial').insert({
    evento_id: evento.id,
    dados: dadosEvento,
    paleta: dadosEvento.paleta || [],
    identidade: { estilo: dadosEvento.estilo, formalidade: dadosEvento.formalidade },
    etapa_atual: 99,
  });

  return { usuarioId, eventoId: evento.id };
}

function createServiceClient() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}