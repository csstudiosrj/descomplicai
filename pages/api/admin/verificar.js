import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Decodifica o payload de um JWT (base64url) sem verificar assinatura.
 * Usado apenas para extrair o user ID (sub) do token do Supabase Auth.
 */
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
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token || typeof token !== 'string') {
    return res.status(401).json({ error: 'Token ausente ou invalido' });
  }

  try {
    // 1. Extrair user ID do JWT localmente (sem chamar auth.getUser)
    const payload = decodeJwtPayload(token);

    if (!payload || !payload.sub) {
      return res.status(401).json({ error: 'Token invalido' });
    }

    const userId = payload.sub;

    // 2. Criar client admin local (sem global.headers.Authorization)
    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 3. Verificar se o usuario e admin na tabela admins (bypass RLS via service_role)
    const { data: adminData, error: adminError } = await admin
      .from('admins')
      .select('id')
      .eq('usuario_id', userId)
      .single();

    if (adminError || !adminData) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // E admin
    return res.status(200).json({ isAdmin: true, userId });
  } catch (err) {
    console.error('[admin/verificar] Erro:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}