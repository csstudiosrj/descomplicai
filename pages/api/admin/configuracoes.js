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

async function isAdmin(req) {
  try {
    const admin = getSupabaseAdmin();
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) token = authHeader.split(' ')[1];
    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/sb-access-token=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }
    if (!token) return false;
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return false;
    const { data } = await admin.from('admins').select('id').eq('id', user.id).single();
    return !!data;
  } catch { return false; }
}

/**
 * GET /api/admin/configuracoes — lista todas agrupadas por categoria
 * PUT /api/admin/configuracoes — atualiza array de { chave, valor }
 */
export default async function handler(req, res) {
  const adminCheck = await isAdmin(req);
  if (!adminCheck) return res.status(403).json({ error: 'Acesso negado' });

  const admin = getSupabaseAdmin();

  if (req.method === 'GET') {
    try {
      const { data, error } = await admin
        .from('configuracoes')
        .select('id, chave, valor, descricao, categoria, atualizado_em, atualizado_por')
        .order('chave', { ascending: true });

      if (error) throw error;

      // Agrupa por categoria
      const agrupado = {};
      (data || []).forEach((cfg) => {
        if (!agrupado[cfg.categoria]) agrupado[cfg.categoria] = [];
        agrupado[cfg.categoria].push(cfg);
      });

      return res.status(200).json({ data: agrupado });
    } catch (err) {
      console.error('[admin/configuracoes GET] erro:', err);
      return res.status(500).json({ error: 'Erro interno', details: err.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { atualizacoes } = req.body; // array de { chave, valor }
      if (!Array.isArray(atualizacoes) || atualizacoes.length === 0) {
        return res.status(400).json({ error: 'atualizacoes deve ser um array nao vazio' });
      }

      let token = null;
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) token = authHeader.split(' ')[1];
      if (!token && req.headers.cookie) {
        const match = req.headers.cookie.match(/sb-access-token=([^;]+)/);
        if (match) token = decodeURIComponent(match[1]);
      }

      let userId = null;
      if (token) {
        const { data: { user } } = await admin.auth.getUser(token);
        userId = user?.id || null;
      }

      const agora = new Date().toISOString();
      const promises = atualizacoes.map(({ chave, valor }) =>
        admin
          .from('configuracoes')
          .update({ valor, atualizado_em: agora, atualizado_por: userId })
          .eq('chave', chave)
      );

      const results = await Promise.all(promises);
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        console.error('[admin/configuracoes PUT] erros:', errors);
        return res.status(500).json({ error: 'Algumas atualizacoes falharam', errors });
      }

      return res.status(200).json({ sucesso: true, atualizadas: atualizacoes.length });
    } catch (err) {
      console.error('[admin/configuracoes PUT] erro:', err);
      return res.status(500).json({ error: 'Erro interno', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
