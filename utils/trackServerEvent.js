import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('[trackServerEvent] SUPABASE_SERVICE_ROLE_KEY não configurada');
      return null;
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

export async function trackServerEvent({
  tipo,
  categoria,
  acao,
  usuario_id = null,
  evento_id = null,
  fornecedor_id = null,
  valor = null,
  dados = {},
  pagina = null,
  step_id = null,
  req = null,
}) {
  try {
    const admin = getSupabaseAdmin();
    if (!admin) return;

    const ip = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || null;
    const userAgent = req?.headers?.['user-agent'] || null;
    const sessao_id = `srv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await admin.from('analytics_eventos').insert({
      sessao_id,
      evento_tipo: tipo,
      categoria: categoria || null,
      acao: acao || null,
      pagina: pagina || null,
      step_id: step_id || null,
      usuario_id: usuario_id || null,
      evento_id: evento_id || null,
      fornecedor_id: fornecedor_id || null,
      valor: valor || null,
      dados: dados && Object.keys(dados).length > 0 ? dados : null,
      user_agent: userAgent,
      ip,
      origem: 'server',
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[trackServerEvent] erro silenciado:', err.message);
    }
  }
}

export async function trackServerEventBatch(eventos) {
  if (!Array.isArray(eventos) || eventos.length === 0) return { success: true, sent: 0 };

  try {
    const admin = getSupabaseAdmin();
    if (!admin) return { success: false, error: 'Supabase não configurado', sent: 0 };

    const batch = eventos.map((e) => ({
      sessao_id: e.sessao_id || `srv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      evento_tipo: e.evento_tipo || e.tipo || 'evento',
      categoria: e.categoria || null,
      acao: e.acao || null,
      pagina: e.pagina || null,
      step_id: e.step_id || null,
      usuario_id: e.usuario_id || null,
      evento_id: e.evento_id || null,
      fornecedor_id: e.fornecedor_id || null,
      valor: e.valor || null,
      dados: e.dados && Object.keys(e.dados).length > 0 ? e.dados : null,
      user_agent: null,
      ip: null,
      origem: 'server',
      criado_em: e.criado_em || new Date().toISOString(),
    }));

    const { error } = await admin.from('analytics_eventos').insert(batch);
    if (error) throw error;
    return { success: true, sent: batch.length };
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[trackServerEventBatch] erro:', err.message);
    }
    return { success: false, error: err.message, sent: 0 };
  }
}

export default trackServerEvent;
