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
 * GET /api/admin/eventos?page=1&limit=20&search=&status=&plano=&data_inicio=&data_fim=
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const adminCheck = await isAdmin(req);
  if (!adminCheck) return res.status(403).json({ error: 'Acesso negado' });

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { search, status, plano, memorial_concluido, data_inicio, data_fim } = req.query;

    const admin = getSupabaseAdmin();
    let query = admin
      .from('eventos')
      .select(`
        id,
        nome_evento,
        data_evento,
        status,
        plano,
        memorial_concluido,
        usuario_id,
        cerimonialista_id,
        criado_em,
        usuarios:usuario_id (email, raw_user_meta_data->>full_name),
        cerimonialistas:cerimonialista_id (nome, email)
      `, { count: 'exact' });

    if (search) {
      query = query.ilike('nome_evento', `%${search}%`);
    }
    if (status) query = query.eq('status', status);
    if (plano) query = query.eq('plano', plano);
    if (memorial_concluido !== undefined) query = query.eq('memorial_concluido', memorial_concluido === 'true');
    if (data_inicio) query = query.gte('criado_em', data_inicio);
    if (data_fim) query = query.lte('criado_em', data_fim);

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
    console.error('[admin/eventos] erro:', err);
    return res.status(500).json({ error: 'Erro interno', details: err.message });
  }
}
