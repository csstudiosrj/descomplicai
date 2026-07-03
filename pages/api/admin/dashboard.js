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

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (payload.length % 4) payload += '=';
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Extrai o access_token do cookie do Supabase.
 * O cookie tem formato: sb-[ref]-auth-token.0=base64-eyJhY2Nlc3NfdG9rZW4iOi... ou
 * sb-[ref]-auth-token=base64-...
 */
function extractTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;

  // Procura cookie sb-xxx-auth-token.0=base64-... ou sb-xxx-auth-token=base64-...
  const match = cookieHeader.match(/sb-[a-z0-9]+-auth-token(?:\.0)?=base64-([^;]+)/);
  if (!match) return null;

  try {
    const base64Payload = decodeURIComponent(match[1]);
    const decoded = Buffer.from(base64Payload, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    return parsed.access_token || null;
  } catch {
    return null;
  }
}

async function isAdmin(req) {
  try {
    let token = null;

    // 1. Tenta header Authorization
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Tenta extrair do cookie do Supabase
    if (!token && req.headers.cookie) {
      token = extractTokenFromCookie(req.headers.cookie);
    }

    if (!token) return false;

    // Decode JWT localmente (sem chamar auth.getUser)
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.sub) return false;

    const userId = payload.sub;

    const admin = getSupabaseAdmin();
    const { data, error: adminError } = await admin
      .from('admins')
      .select('id')
      .eq('usuario_id', userId)
      .single();

    return !!data && !adminError;
  } catch {
    return false;
  }
}

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

    const { data: fornecedoresPendentes, error: fpError } = await admin
      .from('fornecedores_plataforma')
      .select('id, nome_empresa, cidade, estado, email, criado_em, ativo, plano, trial_inicio')
      .or('ativo.eq.false,plano.eq.trial')
      .order('criado_em', { ascending: false })
      .limit(5);

    const { data: eventosAlerta, error: alertaError } = await admin
      .from('eventos')
      .select('id, nome_evento, data_evento, memorial_concluido, status, usuario_id, criado_em')
      .eq('memorial_concluido', false)
      .lt('criado_em', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('criado_em', { ascending: true })
      .limit(10);

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