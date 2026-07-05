// pages/api/memorial/criar-evento.js
/**
 * API Route — Cria evento + memorial no Supabase ao final do Bloco C
 * POST /api/memorial/criar-evento
 * Body: { estado: Object }
 * Headers: Authorization (JWT do Supabase)
 */

import { createClient } from '@supabase/supabase-js';
import { withRateLimit, strictLimiter } from '@/lib/rateLimit.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Extrai dados do estado do memorial para popular o evento */
function extrairDadosEvento(estado) {
  if (!estado || typeof estado !== 'object') return {};

  const nomes = [];
  if (estado.nomeNoiva) nomes.push(estado.nomeNoiva);
  if (estado.nomeNoivo) nomes.push(estado.nomeNoivo);

  const nomeEvento = nomes.length > 0
    ? `Casamento de ${nomes.join(' e ')}`
    : 'Meu casamento';

  return {
    nome_evento: nomeEvento,
    data_evento: estado.dataCasamento || estado.dataEvento || null,
    cidade: estado.cidade || null,
    total_convidados: estado.totalConvidados ? String(estado.totalConvidados) : null,
    orcamento: estado.orcamentoTotal ? Number(estado.orcamentoTotal) : null,
    tipo_cerimonia: estado.tipoCerimonia || null,
    tipo_local: estado.tipoLocal || null,
    estilo: estado.estilo || null,
    status: 'memorial',
    plano: 'gratuito',
    memorial_concluido: false,
    criado_por: 'casal',
  };
}

async function _handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autenticacao necessaria' });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Valida token e extrai user
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Token invalido' });
  }

  const { estado } = req.body;
  if (!estado || typeof estado !== 'object') {
    return res.status(400).json({ error: 'Estado invalido' });
  }

  try {
    // 1. Verifica se ja existe evento para este usuario
    const { data: eventoExistente, error: evtCheckErr } = await supabaseAdmin
      .from('eventos')
      .select('id, nome_evento, status, plano, acesso_iniciado_em, memoriais_id')
      .eq('usuario_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (evtCheckErr) throw evtCheckErr;

    let eventoId;
    let memorialId;

    if (eventoExistente) {
      // Reutiliza evento existente, atualiza com dados mais recentes do memorial
      eventoId = eventoExistente.id;
      memorialId = eventoExistente.memoriais_id;

      const dadosEvento = extrairDadosEvento(estado);
      const { error: updEvtErr } = await supabaseAdmin
        .from('eventos')
        .update({
          ...dadosEvento,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', eventoId);

      if (updEvtErr) throw updEvtErr;

      // Atualiza memorial existente
      if (memorialId) {
        const { error: updMemErr } = await supabaseAdmin
          .from('memoriais')
          .update({
            estado,
            atualizado_em: new Date().toISOString(),
          })
          .eq('id', memorialId);

        if (updMemErr) throw updMemErr;
      } else {
        // Cria memorial vinculado ao evento existente
        const { data: novoMemorial, error: memErr } = await supabaseAdmin
          .from('memoriais')
          .insert({
            user_id: user.id,
            evento_id: eventoId,
            estado,
            concluido: false,
          })
          .select('id')
          .single();

        if (memErr) throw memErr;
        memorialId = novoMemorial.id;

        // Vincula memorial ao evento
        await supabaseAdmin
          .from('eventos')
          .update({ memoriais_id: memorialId })
          .eq('id', eventoId);
      }
    } else {
      // 2. Cria evento novo
      const dadosEvento = extrairDadosEvento(estado);
      const { data: novoEvento, error: evtErr } = await supabaseAdmin
        .from('eventos')
        .insert({
          usuario_id: user.id,
          ...dadosEvento,
        })
        .select('id')
        .single();

      if (evtErr) throw evtErr;
      eventoId = novoEvento.id;

      // 3. Cria memorial vinculado ao evento
      const { data: novoMemorial, error: memErr } = await supabaseAdmin
        .from('memoriais')
        .insert({
          user_id: user.id,
          evento_id: eventoId,
          estado,
          concluido: false,
        })
        .select('id')
        .single();

      if (memErr) throw memErr;
      memorialId = novoMemorial.id;

      // 4. Vincula memorial ao evento
      const { error: linkErr } = await supabaseAdmin
        .from('eventos')
        .update({ memoriais_id: memorialId })
        .eq('id', eventoId);

      if (linkErr) throw linkErr;
    }

    // 5. Retorna evento completo
    const { data: eventoCompleto, error: evtFinalErr } = await supabaseAdmin
      .from('eventos')
      .select('*')
      .eq('id', eventoId)
      .single();

    if (evtFinalErr) throw evtFinalErr;

    return res.status(200).json({
      sucesso: true,
      evento: eventoCompleto,
      evento_id: eventoId,
      memorial_id: memorialId,
      criado_novo: !eventoExistente,
    });

  } catch (e) {
    console.error('[API memorial/criar-evento]', e);
    return res.status(500).json({ sucesso: false, erro: e.message });
  }
}

export default withRateLimit(_handler, strictLimiter);
