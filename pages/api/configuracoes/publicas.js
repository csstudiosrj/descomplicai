import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabaseAdmin;
}

/**
 * GET /api/configuracoes/publicas
 * Retorna configurações públicas (feature_flags, textos_legais, planos)
 * Sem autenticação necessária
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('configuracoes')
      .select('chave, valor, descricao, categoria')
      .in('categoria', ['feature_flags', 'textos_legais', 'planos', 'sistema'])
      .order('chave', { ascending: true });

    if (error) throw error;

    const resultado = {};
    (data || []).forEach((cfg) => {
      resultado[cfg.chave] = cfg.valor;
    });

    return res.status(200).json({ data: resultado });
  } catch (err) {
    console.error('[configuracoes/publicas] erro:', err);
    return res.status(500).json({ error: 'Erro interno', details: err.message });
  }
}
