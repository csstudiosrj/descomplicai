import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token || typeof token !== 'string') {
    return res.status(401).json({ error: 'Token ausente' });
  }

  try {
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.sub) {
      return res.status(401).json({ error: 'Token invalido' });
    }

    const userId = payload.sub;

    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: adminData, error: adminError } = await admin
      .from('admins')
      .select('id')
      .eq('usuario_id', userId)
      .single();

    if (adminError || !adminData) {
      return res.status(200).json({ isAdmin: false });
    }

    return res.status(200).json({ isAdmin: true, userId });
  } catch (err) {
    console.error('[auth/verificar-admin] Erro:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}