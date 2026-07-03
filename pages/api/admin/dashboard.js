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

    // 2. Montador de Cookie Chunked
    if (!token && req.cookies) {
      const baseCookieNames = new Set();
      Object.keys(req.cookies).forEach(k => {
        if (k.startsWith('sb-') && k.includes('-auth-token')) {
          baseCookieNames.add(k.split('.')[0]);
        }
      });

      for (let baseName of baseCookieNames) {
        let fullCookieString = '';
        let i = 0;

        if (req.cookies[baseName]) {
          fullCookieString = req.cookies[baseName];
        } else {
          while (req.cookies[`${baseName}.${i}`]) {
            fullCookieString += req.cookies[`${baseName}.${i}`];
            i++;
          }
        }

        if (fullCookieString) {
          try {
            let cleanBase64 = fullCookieString;
            if (cleanBase64.startsWith('base64-')) {
              cleanBase64 = cleanBase64.substring(7);
            }

            const jsonStr = Buffer.from(cleanBase64, 'base64').toString('utf-8');
            const sessionData = JSON.parse(jsonStr);
            const foundToken = sessionData.access_token || (Array.isArray(sessionData) ? sessionData[0] : null);

            if (foundToken) {
              token = foundToken;
              break;
            }
          } catch (err) {
            console.error(`Erro ao decodificar ${baseName}:`, err.message);
          }
        }
      }
    }

    if (!token) {
      return { valid: false, reason: 'no_token', debug: { hasCookies: !!req.headers.cookie, cookieKeys: req.cookies ? Object.keys(req.cookies) : [] } };
    }

    // === VALIDAÇÃO PRIMÁRIA: supabaseAdmin.auth.getUser (igual verificar.js) ===
    const admin = getSupabaseAdmin();
    const { data: userData, error: userError } = await admin.auth.getUser(token);

    if (userError || !userData?.user) {
      // Fallback: decode JWT local
      const payload = decodeJwtPayload(token);
      if (!payload || !payload.sub) {
        return { valid: false, reason: 'token_invalid', debug: { getUserError: userError?.message, jwtDecode: !!payload } };
      }
      const userId = payload.sub;
      const { data, error: adminError } = await admin
        .from('admins')
        .select('id')
        .eq('usuario_id', userId)
        .single();
      return { valid: !!data && !adminError, reason: !!data && !adminError ? null : 'not_admin', debug: { fallback: 'jwt_decode', userId } };
    }

    const userId = userData.user.id;
    const { data, error: adminError } = await admin
      .from('admins')
      .select('id')
      .eq('usuario_id', userId)
      .single();

    return { valid: !!data && !adminError, reason: !!data && !adminError ? null : 'not_admin', debug: { method: 'getUser', userId } };
  } catch (err) {
    return { valid: false, reason: 'exception', debug: { message: err.message } };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminCheck = await isAdmin(req);

  // LOG TEMPORARIO
  console.log('[dashboard] adminCheck:', JSON.stringify(adminCheck));
  console.log('[dashboard] auth header:', req.headers.authorization?.substring(0, 30));

  if (!adminCheck.valid) {
    return res.status(403).json({
      error: 'Acesso negado. Apenas administradores.',
      reason: adminCheck.reason,
      debug: adminCheck.debug,
    });
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