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
 * GET /api/admin/pagamentos?page=1&limit=20&tipo=&status=&data_inicio=&data_fim=&agrupamento=dia
 * agrupamento: dia | semana | mes
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const adminCheck = await isAdmin(req);
  if (!adminCheck) return res.status(403).json({ error: 'Acesso negado' });

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const { tipo, status, data_inicio, data_fim, agrupamento = 'dia' } = req.query;
    const admin = getSupabaseAdmin();

    // Lista de transações
    let query = admin
      .from('pagamentos')
      .select(`
        id,
        tipo,
        valor,
        status,
        criado_em,
        usuario_id,
        evento_id,
        usuarios:usuario_id (email),
        eventos:evento_id (nome_evento)
      `, { count: 'exact' });

    if (tipo) query = query.eq('tipo', tipo);
    if (status) query = query.eq('status', status);
    if (data_inicio) query = query.gte('criado_em', data_inicio);
    if (data_fim) query = query.lte('criado_em', data_fim);

    query = query.order('criado_em', { ascending: false }).range(offset, offset + limit - 1);

    const { data: transacoes, error, count } = await query;
    if (error) throw error;

    // Receita agregada por período
    let groupFormat;
    switch (agrupamento) {
      case 'semana': groupFormat = "YYYY-'W'WW"; break;
      case 'mes': groupFormat = 'YYYY-MM'; break;
      default: groupFormat = 'YYYY-MM-DD';
    }

    const { data: receitaRaw, error: receitaError } = await admin
      .rpc('receita_por_periodo', {
        p_data_inicio: data_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_data_fim: data_fim || new Date().toISOString().split('T')[0],
        p_formato: groupFormat,
      });

    // Se a RPC não existir, faz query manual
    let receita = [];
    if (receitaError) {
      const { data: manualReceita } = await admin
        .from('pagamentos')
        .select('tipo, valor, status, criado_em')
        .eq('status', 'pago')
        .gte('criado_em', data_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('criado_em', data_fim ? data_fim + 'T23:59:59' : new Date().toISOString());

      // Agrupa manualmente
      const grouped = {};
      (manualReceita || []).forEach(p => {
        const date = new Date(p.criado_em);
        let key;
        if (agrupamento === 'mes') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else if (agrupamento === 'semana') {
          const startOfYear = new Date(date.getFullYear(), 0, 1);
          const weekNum = Math.ceil((((date - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
          key = `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }
        if (!grouped[key]) grouped[key] = { periodo: key, pdf: 0, assinatura: 0, fornecedor: 0, total: 0 };
        grouped[key][p.tipo] = (grouped[key][p.tipo] || 0) + (parseFloat(p.valor) || 0);
        grouped[key].total += parseFloat(p.valor) || 0;
      });
      receita = Object.values(grouped).sort((a, b) => a.periodo.localeCompare(b.periodo));
    } else {
      receita = receitaRaw || [];
    }

    // Totalizadores
    const { data: totalizadores } = await admin
      .from('pagamentos')
      .select('tipo, valor, status')
      .eq('status', 'pago')
      .gte('criado_em', data_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('criado_em', data_fim ? data_fim + 'T23:59:59' : new Date().toISOString());

    const totais = {
      receita_total: 0,
      por_fonte: { pdf: 0, assinatura: 0, fornecedor: 0 },
      por_mes: {},
    };

    (totalizadores || []).forEach(p => {
      const v = parseFloat(p.valor) || 0;
      totais.receita_total += v;
      if (p.tipo) totais.por_fonte[p.tipo] = (totais.por_fonte[p.tipo] || 0) + v;

      const mes = new Date(p.criado_em).toISOString().slice(0, 7);
      totais.por_mes[mes] = (totais.por_mes[mes] || 0) + v;
    });

    return res.status(200).json({
      transacoes: transacoes || [],
      receita,
      totais,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    console.error('[admin/pagamentos] erro:', err);
    return res.status(500).json({ error: 'Erro interno', details: err.message });
  }
}
