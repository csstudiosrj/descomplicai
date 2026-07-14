// pages/api/memorial/perfil.js
// API: Cria evento + memorial a partir do perfil (Fase 0)

import { createClient } from '@supabase/supabase-js';
import { extractSupabaseToken } from '../../../lib/extractSupabaseToken';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function extractTokenFromHeader(req) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Metodo nao permitido. Use POST.' });
  }

  // Tenta header Authorization primeiro, depois cookie
  let token = extractTokenFromHeader(req) || extractSupabaseToken(req);
  if (!token) {
    return res.status(401).json({ erro: 'Token de autenticacao nao fornecido.' });
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ erro: 'Token invalido ou expirado.' });
  }

  const userId = user.id;

  const {
    perfilCasal, dataCasamento, cidade, uf,
    totalConvidados, modoPlanejamento, nomeEvento,
  } = req.body;

  const erros = [];
  if (!perfilCasal) erros.push('perfilCasal e obrigatorio');
  if (!dataCasamento) erros.push('dataCasamento e obrigatoria');
  if (!cidade?.trim()) erros.push('cidade e obrigatoria');
  if (!uf?.trim()) erros.push('uf e obrigatoria');
  if (!modoPlanejamento) erros.push('modoPlanejamento e obrigatorio');

  if (erros.length > 0) {
    return res.status(400).json({ erro: 'Campos obrigatorios faltando', detalhes: erros });
  }

  const agora = new Date();
  const expiraEm = new Date(agora);
  expiraEm.setDate(expiraEm.getDate() + 7);

  try {
    const { data: evento, error: eventoError } = await supabaseAdmin
      .from('eventos')
      .insert({
        usuario_id: userId,
        nome_evento: nomeEvento?.trim() || 'Casamento',
        data_evento: dataCasamento,
        cidade: cidade.trim(),
        total_convidados: String(totalConvidados || 0),
        status: 'memorial',
        plano: 'trial',
        acesso_iniciado_em: agora.toISOString(),
        acesso_expira_em: expiraEm.toISOString(),
        criado_por: 'casal',
        perfil_casal: perfilCasal,
        modo_planejamento: modoPlanejamento,
      })
      .select('id')
      .single();

    if (eventoError) {
      console.error('[API/perfil] Erro ao criar evento:', eventoError);
      return res.status(500).json({ erro: 'Erro ao criar evento', detalhes: eventoError.message });
    }

    const eventoId = evento.id;

    const { error: memorialError } = await supabaseAdmin
      .from('memoriais')
      .insert({
        user_id: userId,
        evento_id: eventoId,
        estado: {},
        dados: {
          perfilCasal, modoPlanejamento, dataCasamento,
          cidade: cidade.trim(), uf: uf.trim(), totalConvidados,
          nomeEvento: nomeEvento?.trim() || '',
        },
        concluido: false,
      });

    if (memorialError) {
      console.error('[API/perfil] Erro ao criar memorial:', memorialError);
    }

    return res.status(201).json({
      sucesso: true,
      evento_id: eventoId,
      mensagem: 'Evento criado com sucesso',
    });

  } catch (err) {
    console.error('[API/perfil] Erro inesperado:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor', detalhes: err.message });
  }
}
