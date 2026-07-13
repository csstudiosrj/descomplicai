// pages/api/memorial/dna.js
// API: Atualiza DNA do evento (Fase 0.5)

import { createClient } from '@supabase/supabase-js';
import { extractSupabaseToken } from '../../../lib/extractSupabaseToken';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ erro: 'Metodo nao permitido. Use PATCH.' });
  }

  const token = extractSupabaseToken(req);
  if (!token) {
    return res.status(401).json({ erro: 'Token de autenticacao nao fornecido.' });
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ erro: 'Token invalido ou expirado.' });
  }

  const userId = user.id;
  const { evento_id, tipoCerimonia, tipoLocal, estilo, formalidade, horarioCasamento } = req.body;

  if (!evento_id) {
    return res.status(400).json({ erro: 'evento_id e obrigatorio' });
  }

  const { data: eventoExistente, error: checkError } = await supabaseAdmin
    .from('eventos')
    .select('id, usuario_id')
    .eq('id', evento_id)
    .single();

  if (checkError || !eventoExistente) {
    return res.status(404).json({ erro: 'Evento nao encontrado' });
  }

  if (eventoExistente.usuario_id !== userId) {
    return res.status(403).json({ erro: 'Acesso negado a este evento' });
  }

  const atualizacoes = {};
  if (tipoCerimonia) atualizacoes.tipo_cerimonia = tipoCerimonia;
  if (tipoLocal) atualizacoes.tipo_local = tipoLocal;
  if (estilo) atualizacoes.estilo = estilo;
  if (formalidade) atualizacoes.formalidade = formalidade;
  if (horarioCasamento) atualizacoes.horario_casamento = horarioCasamento;
  atualizacoes.atualizado_em = new Date().toISOString();

  if (Object.keys(atualizacoes).length === 0) {
    return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
  }

  try {
    const { error: updateError } = await supabaseAdmin
      .from('eventos')
      .update(atualizacoes)
      .eq('id', evento_id);

    if (updateError) {
      console.error('[API/dna] Erro ao atualizar evento:', updateError);
      return res.status(500).json({ erro: 'Erro ao atualizar DNA', detalhes: updateError.message });
    }

    const { data: memorialAtual } = await supabaseAdmin
      .from('memoriais')
      .select('dados')
      .eq('evento_id', evento_id)
      .maybeSingle();

    const dadosAtuais = memorialAtual?.dados || {};
    const novosDados = {
      ...dadosAtuais,
      tipoCerimonia, tipoLocal, estilo, formalidade, horarioCasamento,
      dnaCompleto: true,
    };

    const { error: memorialError } = await supabaseAdmin
      .from('memoriais')
      .update({ dados: novosDados })
      .eq('evento_id', evento_id);

    if (memorialError) {
      console.warn('[API/dna] Erro ao atualizar memorial:', memorialError);
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: 'DNA atualizado com sucesso',
      evento_id,
    });

  } catch (err) {
    console.error('[API/dna] Erro inesperado:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor', detalhes: err.message });
  }
}
