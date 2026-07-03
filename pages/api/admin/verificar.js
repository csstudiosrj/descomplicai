// pages/api/admin/verificar.js
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

function extractTokenFromCookies(req) {
  if (!req.cookies) return null;

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

    if (!fullCookieString) continue;

    // Tentativa 1: base64 com prefixo base64-
    let clean = fullCookieString;
    if (clean.startsWith('base64-')) {
      clean = clean.substring(7);
    }
    try {
      const decoded = Buffer.from(clean, 'base64').toString('utf-8');
      const data = JSON.parse(decoded);
      if (data.access_token) return data.access_token;
      if (Array.isArray(data) && data[0]) return data[0];
    } catch (e) {}

    // Tentativa 2: JSON direto (sem base64)
    try {
      const data = JSON.parse(fullCookieString);
      if (data.access_token) return data.access_token;
      if (Array.isArray(data) && data[0]) return data[0];
    } catch (e) {}

    // Tentativa 3: JWT direto no cookie
    if (fullCookieString.split('.').length === 3) {
      return fullCookieString;
    }
  }

  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let token = null;
    let source = 'none';

    // 1. Header Authorization
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      source = 'header';
    }

    // 2. Cookie chunkado (inline, nao usa lib externa)
    if (!token) {
      token = extractTokenFromCookies(req);
      if (token) source = 'cookie';
    }

    if (!token) {
      return res.status(401).json({
        isAdmin: false,
        error: 'Token nao encontrado',
        debug: {
          hasCookies: !!req.headers.cookie,
          cookieNames: req.cookies ? Object.keys(req.cookies).filter(k => k.startsWith('sb-')) : [],
          authHeader: !!authHeader,
        },
      });
    }

    // 3. Validação primária: getUser
    const admin = getSupabaseAdmin();
    const { data: userData, error: userError } = await admin.auth.getUser(token);

    let userId = null;

    if (userError || !userData?.user) {
      // Fallback: decode JWT local
      const payload = decodeJwtPayload(token);
      if (!payload || !payload.sub) {
        return res.status(401).json({
          isAdmin: false,
          error: 'Token invalido',
          debug: {
            source,
            tokenPreview: token.substring(0, 20) + '...',
            tokenParts: token.split('.').length,
            getUserError: userError?.message || null,
          },
        });
      }
      userId = payload.sub;
    } else {
      userId = userData.user.id;
    }

    // 4. Verifica se é admin
    const { data: adminRecord, error: adminError } = await admin
      .from('admins')
      .select('id')
      .eq('usuario_id', userId)
      .maybeSingle();

    if (adminError) {
      return res.status(500).json({ isAdmin: false, error: 'Erro ao verificar admin', details: adminError.message });
    }

    return res.status(200).json({
      isAdmin: !!adminRecord,
      userId: userId,
      method: userData?.user ? 'getUser' : 'jwt_fallback',
    });

  } catch (err) {
    return res.status(500).json({ isAdmin: false, error: err.message });
  }
}