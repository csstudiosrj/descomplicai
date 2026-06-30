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
 * GET /api/admin/usuarios?page=1&limit=20&search=&tipo=
 * Lista usuários agregados: casais, cerimonialistas, fornecedores
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const adminCheck = await isAdmin(req);
  if (!adminCheck) return res.status(403).json({ error: 'Acesso negado' });

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const { search, tipo } = req.query;
    const admin = getSupabaseAdmin();

    // Busca casais (DISTINCT de eventos.usuario_id)
    let casaisQuery = admin
      .from('eventos')
      .select('usuario_id, usuarios:usuario_id (email, raw_user_meta_data), criado_em, memorial_concluido, status', { count: 'exact' })
      .not('usuario_id', 'is', null);

    if (search) {
      casaisQuery = casaisQuery.or(`usuarios.email.ilike.%${search}%,usuarios.raw_user_meta_data->>full_name.ilike.%${search}%`);
    }

    const { data: casaisRaw, error: casaisError, count: casaisCount } = await casaisQuery
      .order('criado_em', { ascending: false })
      .range(offset, offset + limit - 1);

    if (casaisError) throw casaisError;

    // Agrega dados dos casais
    const casaisMap = new Map();
    (casaisRaw || []).forEach(ev => {
      const uid = ev.usuario_id;
      if (!casaisMap.has(uid)) {
        casaisMap.set(uid, {
          id: uid,
          tipo: 'casal',
          email: ev.usuarios?.email || '-',
          nome: ev.usuarios?.raw_user_meta_data?.full_name || '-',
          total_eventos: 0,
          memorial_concluido: false,
          ultimo_acesso: ev.criado_em,
          status: ev.status,
        });
      }
      const c = casaisMap.get(uid);
      c.total_eventos += 1;
      if (ev.memorial_concluido) c.memorial_concluido = true;
      if (new Date(ev.criado_em) > new Date(c.ultimo_acesso)) {
        c.ultimo_acesso = ev.criado_em;
      }
    });

    // Busca cerimonialistas
    let cerimQuery = admin
      .from('cerimonialistas')
      .select('id, nome, email, ativo, criado_em', { count: 'exact' });

    if (search) {
      cerimQuery = cerimQuery.or(`nome.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: cerimRaw, error: cerimError, count: cerimCount } = await cerimQuery
      .order('criado_em', { ascending: false })
      .range(offset, offset + limit - 1);

    if (cerimError) throw cerimError;

    const cerimonialistas = (cerimRaw || []).map(c => ({
      id: c.id,
      tipo: 'cerimonialista',
      email: c.email,
      nome: c.nome,
      total_eventos: 0,
      memorial_concluido: false,
      ultimo_acesso: c.criado_em,
      status: c.ativo ? 'ativo' : 'inativo',
    }));

    // Busca fornecedores
    let fornQuery = admin
      .from('fornecedores_plataforma')
      .select('id, nome_empresa, email, cidade, estado, ativo, plano, criado_em', { count: 'exact' });

    if (search) {
      fornQuery = fornQuery.or(`nome_empresa.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: fornRaw, error: fornError, count: fornCount } = await fornQuery
      .order('criado_em', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fornError) throw fornError;

    const fornecedores = (fornRaw || []).map(f => ({
      id: f.id,
      tipo: 'fornecedor',
      email: f.email,
      nome: f.nome_empresa,
      total_eventos: 0,
      memorial_concluido: false,
      ultimo_acesso: f.criado_em,
      status: f.ativo ? 'ativo' : 'inativo',
      plano: f.plano,
      cidade: f.cidade,
      estado: f.estado,
    }));

    // Combina e filtra por tipo
    let todos = [
      ...Array.from(casaisMap.values()),
      ...cerimonialistas,
      ...fornecedores,
    ];

    if (tipo && tipo !== 'todos') {
      todos = todos.filter(u => u.tipo === tipo);
    }

    // Ordena por último acesso
    todos.sort((a, b) => new Date(b.ultimo_acesso) - new Date(a.ultimo_acesso));

    const total = (casaisCount || 0) + (cerimCount || 0) + (fornCount || 0);

    return res.status(200).json({
      data: todos.slice(0, limit),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[admin/usuarios] erro:', err);
    return res.status(500).json({ error: 'Erro interno', details: err.message });
  }
}
