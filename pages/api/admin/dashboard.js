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

async function isAdmin(req) {
  try {
    let token = null;

    // 1. Tenta o header primeiro
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Caçada dinâmica ao cookie do Supabase
    if (!token && req.cookies) {
      const cookieKey = Object.keys(req.cookies).find(k => k.startsWith('sb-') && k.includes('-auth-token'));
      const rawCookie = cookieKey ? req.cookies[cookieKey] : null;

      if (rawCookie) {
        try {
          const base64Data = rawCookie.startsWith('base64-') ? rawCookie.replace('base64-', '') : rawCookie;
          const sessionData = JSON.parse(Buffer.from(base64Data, 'base64').toString('utf-8'));
          token = sessionData.access_token || (Array.isArray(sessionData) ? sessionData[0] : null);
        } catch (err) {
          console.error("Erro ao decodificar o cookie:", err);
        }
      }
    }

    if (!token) {
      console.log("ALERTA: Token ausente. Headers recebidos:", req.headers);
      console.log("ALERTA: Cookies recebidos:", req.cookies);
      return false;
    }

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

    const { data: metrics, error: metricsError } = await admin.rpc('dashboard_metrics');
    if (metricsError) throw metricsError;

    const { data: abandono, error: abandonoError } = await admin.rpc('memorial_abandono_ultimos_30_dias');
    if (abandonoError) throw abandonoError;

    const { data: paginas, error: paginasError } = await admin.rpc('paginas_mais_acessadas', { p_dias: dias });
    if (paginasError) throw paginasError;

    const { data: tempo, error: tempoError } = await admin.rpc('tempo_medio_por_pagina', { p_dias: dias });
    if (tempoError) throw tempoError;

    const { data: funil, error: funilError } = await admin.rpc('funil_checkout_ultimos_30_dias');
    if (funilError) throw funilError;

    const { data: fornecedoresPendentes } = await admin
      .from('fornecedores_plataforma')
      .select('id, nome_empresa, cidade, estado, email, criado_em, ativo, plano, trial_inicio')
      .or('ativo.eq.false,plano.eq.trial')
      .order('criado_em', { ascending: false })
      .limit(5);

    const { data: eventosAlerta } = await admin
      .from('eventos')
      .select('id, nome_evento, data_evento, memorial_concluido, status, usuario_id, criado_em')
      .eq('memorial_concluido', false)
      .lt('criado_em', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('criado_em', { ascending: true })
      .limit(10);

    const { data: trialExpirando } = await admin
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