// pages/api/vitrine/orcamento.js
// API pública para criar lead no funil do cerimonialista
// Também captura o interessado para a plataforma (funnel de aquisição)
// INSERT sem autenticação — a RLS da tabela cerimonialista_leads permite INSERT null

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const {
    cerimonialista_id,
    nome_lead,
    email,
    telefone,
    tipo_evento,
    data_prevista,
    notas,
  } = req.body;

  // Validações
  if (!cerimonialista_id) {
    return res.status(400).json({ erro: 'ID do cerimonialista é obrigatório' });
  }
  if (!nome_lead || nome_lead.trim().length < 2) {
    return res.status(400).json({ erro: 'Nome é obrigatório' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ erro: 'E-mail válido é obrigatório' });
  }

  try {
    // Verifica se o cerimonialista existe e está ativo
    const { data: cerim, error: cerimError } = await supabaseAdmin
      .from('cerimonialistas')
      .select('id, nome_empresa, ativo')
      .eq('id', cerimonialista_id)
      .single();

    if (cerimError || !cerim || !cerim.ativo) {
      return res.status(404).json({ erro: 'Cerimonialista não encontrado ou inativo' });
    }

    // Insere o lead no funil
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('cerimonialista_leads')
      .insert({
        cerimonialista_id,
        nome_lead: nome_lead.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone?.trim() || null,
        tipo_evento: tipo_evento?.trim() || null,
        data_prevista: data_prevista || null,
        notas: notas?.trim() || null,
        estagio: 'contato_inicial',
        fonte: 'vitrine',
      })
      .select()
      .single();

    if (leadError) {
      console.error('[API Vitrine Orcamento] Erro ao inserir lead:', leadError);
      return res.status(500).json({ erro: 'Erro ao salvar orçamento. Tente novamente.' });
    }

    // TODO: Futuro — integrar com sistema de e-mail/marketing da plataforma
    // Aqui é onde a plataforma captura o lead para próprio funil de aquisição

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Orçamento enviado com sucesso',
      lead_id: lead.id,
    });
  } catch (err) {
    console.error('[API Vitrine Orcamento] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno ao processar orçamento' });
  }
}
