// pages/api/admin/verificar.js
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseToken } from '../../../lib/extractSupabaseToken';

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let token = null;

    // 1. Header Authorization
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Cookie chunkado via lib
    if (!token) {
      token = extractSupabaseToken(req);
    }

    if (!token) {
      return res.status(401).json({ 
        isAdmin: false, 
        error: 'Token nao encontrado',
        cookies: req.headers.cookie ? 'presente' : 'ausente'
      });
    }

    // 3. Validação primária: getUser
    const admin = getSupabaseAdmin();
    const { data: userData, error: userError } = await admin.auth.getUser(token);

    if (userError || !userData?.user) {
      // Fallback: decode JWT local
      const payload = decodeJwtPayload(token);
      if (!payload || !payload.sub) {
        return res.status(401).json({ isAdmin: false, error: 'Token invalido' });
      }

      const { data: adminRecord } = await admin
        .from('admins')
        .select('id')
        .eq('usuario_id', payload.sub)
        .maybeSingle();

      return res.status(200).json({ 
        isAdmin: !!adminRecord,
        userId: payload.sub,
        method: 'jwt_fallback'
      });
    }

    const userId = userData.user.id;
    const { data: adminRecord } = await admin
      .from('admins')
      .select('id')
      .eq('usuario_id', userId)
      .maybeSingle();

    return res.status(200).json({ 
      isAdmin: !!adminRecord,
      userId: userId,
      email: userData.user.email,
      method: 'getUser'
    });

  } catch (err) {
    return res.status(500).json({ isAdmin: false, error: err.message });
  }
}