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
 * GET /api/admin/fornecedores?page=1&limit=20&search=&ativo=&plano=&cidade=&estado=
 * PATCH /api/admin/fornecedores — body: { id, ativo }
 */
export default async function handler(req, res) {
  const adminCheck = await isAdmin(req);
  if (!adminCheck) return res.status(403).json({ error: 'Acesso negado' });

  const admin = getSupabaseAdmin();

  if (req.method === 'GET') {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
      const offset = (page - 1) * limit;
      const { search, ativo, plano, cidade, estado } = req.query;

      let query = admin
        .from('fornecedores_plataforma')
        .select('id, nome_empresa, email, cidade, estado, ativo, plano, trial_inicio, avaliacao_media, total_avaliacoes, criado_em', { count: 'exact' });

      if (search) {
        query = query.or(`nome_empresa.ilike.%${search}%,cidade.ilike.%${search}%`);
      }
      if (ativo !== undefined && ativo !== '') query = query.eq('ativo', ativo === 'true');
      if (plano) query = query.eq('plano', plano);
      if (cidade) query = query.ilike('cidade', `%${cidade}%`);
      if (estado) query = query.ilike('estado', `%${estado}%`);

      query = query.order('criado_em', { ascending: false }).range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return res.status(200).json({
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    } catch (err) {
      console.error('[admin/fornecedores GET] erro:', err);
      return res.status(500).json({ error: 'Erro interno', details: err.message });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id, ativo } = req.body;
      if (!id || typeof ativo !== 'boolean') {
        return res.status(400).json({ error: 'id e ativo (boolean) são obrigatórios' });
      }

      const { data, error } = await admin
        .from('fornecedores_plataforma')
        .update({ ativo, atualizado_em: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error('[admin/fornecedores PATCH] erro:', err);
      return res.status(500).json({ error: 'Erro interno', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
