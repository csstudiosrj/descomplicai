import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuração do Supabase incompleta');
    }
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
}

/**
 * POST /api/analytics/track
 * Recebe eventos do client-side e insere na tabela analytics_eventos.
 * Retorna 200 imediatamente (fire-and-forget, não bloqueia o usuário).
 */
export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      sessao_id,
      evento_tipo,
      categoria,
      acao,
      pagina,
      step_id,
      fornecedor_id,
      evento_id,
      valor,
      tempo_na_pagina,
      dados,
    } = req.body;

    if (!sessao_id || !evento_tipo) {
      return res.status(400).json({ error: 'sessao_id e evento_tipo são obrigatórios' });
    }

    const admin = getSupabaseAdmin();

    // Extrai usuario_id do JWT se autenticado
    let usuario_id = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await admin.auth.getUser(token);
        if (!error && user) {
          usuario_id = user.id;
        }
      } catch {
        // ignora erro de auth
      }
    }

    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    await admin.from('analytics_eventos').insert({
      sessao_id,
      evento_tipo,
      categoria: categoria || null,
      acao: acao || null,
      pagina: pagina || null,
      step_id: step_id || null,
      fornecedor_id: fornecedor_id || null,
      evento_id: evento_id || null,
      usuario_id,
      valor: valor || null,
      tempo_na_pagina: tempo_na_pagina || null,
      dados: dados && Object.keys(dados).length > 0 ? dados : null,
      user_agent: userAgent,
      ip,
      origem: 'client',
    });

    // Retorna 200 imediatamente — não bloqueia o usuário
    return res.status(200).json({ ok: true });
  } catch (err) {
    // Mesmo em erro, retorna 200 para não quebrar o client
    if (process.env.NODE_ENV === 'development') {
      console.error('[analytics/track] erro:', err.message);
    }
    return res.status(200).json({ ok: false, error: err.message });
  }
}
