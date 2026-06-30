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

/**
 * Rastreia eventos no servidor silenciosamente.
 * Nunca quebra a API original se analytics falhar.
 */
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

    // Gera sessao_id server-side baseado em IP + timestamp (aproximado)
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
    // Silencia completamente — analytics nunca quebra a API
    if (process.env.NODE_ENV === 'development') {
      console.warn('[trackServerEvent] erro silenciado:', err.message);
    }
  }
}

export default trackServerEvent;
