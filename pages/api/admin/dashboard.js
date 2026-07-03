import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variaveis de ambiente Supabase nao configuradas');
    }
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabaseAdmin;
}

/**
 * Verifica se o usuario e admin.
 * Tenta extrair do header Authorization (Bearer token) ou do cookie session.
 */
async function isAdmin(req) {
  try {
    const admin = getSupabaseAdmin();
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/sb-access-token=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }

    if (!token) return false;

    const { data: { user }, error } = await admin.auth.getUser(token);
    if (error || !user) return false;

    const { data, error: adminError } = await admin
      .from('admins')
      .select('id')
      .eq('usuario_id', user.id)
      .single();

    return !!data && !adminError;
  } catch {
    return false;
  }
}

/**
 * GET /api/admin/dashboard?dias=30
 * Retorna metricas agregadas para o dashboard admin.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminCheck = await isAdmin(req);
  if (!adminCheck) {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }

  try {
    const dias = Math.min(parseInt(req.query.dias) || 30, 360);
    const admin = getSupabaseAdmin();

    // Metricas do dashboard (RPCs existentes)
    const { data: metrics, error: metricsError } = await admin
      .rpc('dashboard_metrics');

    if (metricsError) throw metricsError;

    const { data: abandono, error: abandonoError } = await admin
      .rpc('memorial_abandono_ultimos_30_dias');

    if (abandonoError) throw abandonoError;

    const { data: paginas, error: paginasError } = await admin
      .rpc('paginas_mais_acessadas', { p_dias: dias });

    if (paginasError) throw paginasError;

    const { data: tempo, error: tempoError } = await admin
      .rpc('tempo_medio_por_pagina', { p_dias: dias });

    if (tempoError) throw tempoError;

    const { data: funil, error: funilError } = await admin
      .rpc('funil_checkout_ultimos_30_dias');

    if (funilError) throw funilError;

    // Fornecedores pendentes (top 5)
    const { data: fornecedoresPendentes, error: fpError } = await admin
      .from('fornecedores_plataforma')
      .select('id, nome_empresa, cidade, estado, email, criado_em, ativo, plano, trial_inicio')
      .or('ativo.eq.false,plano.eq.trial')
      .order('criado_em', { ascending: false })
      .limit(5);

    // Alertas: eventos sem memorial concluido ha +30 dias
    const { data: eventosAlerta, error: alertaError } = await admin
      .from('eventos')
      .select('id, nome_evento, data_evento, memorial_concluido, status, usuario_id, criado_em')
      .eq('memorial_concluido', false)
      .lt('criado_em', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('criado_em', { ascending: true })
      .limit(10);

    // Fornecedores com trial expirando
    const { data: trialExpirando, error: trialError } = await admin
      .from('fornecedores_plataforma')
      .select('id, nome_empresa, email, trial_inicio, plano')
      .eq('plano', 'trial')
      .lt('trial_inicio', new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString())
      .order('trial_inicio', { ascending: true })
      .limit(10);

    return res.status(200).json({
      metrics: metrics || [],
      abandono: abandono || [],
      paginas: paginas || [],
      tempo: tempo || [],
      funil: funil || [],
      fornecedoresPendentes: fornecedoresPendentes || [],
      alertas: {
        eventosSemMemorial: eventosAlerta || [],
        trialExpirando: trialExpirando || [],
      },
      periodoDias: dias,
    });
  } catch (err) {
    console.error('[admin/dashboard] erro:', err);
    return res.status(500).json({ error: 'Erro interno ao carregar dashboard', details: err.message });
  }
}
