// pages/api/admin/verificar.js
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseToken } from '../../lib/extractSupabaseToken';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const token = extractSupabaseToken(req);
    
    if (!token) {
      return res.status(401).json({ 
        isAdmin: false, 
        error: 'Token não encontrado',
        cookies: req.headers.cookie ? 'presente' : 'ausente'
      });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ isAdmin: false, error: 'Token inválido' });
    }

    const { data: admin } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    return res.status(200).json({ 
      isAdmin: !!admin,
      userId: user.id,
      email: user.email
    });

  } catch (err) {
    return res.status(500).json({ isAdmin: false, error: err.message });
  }
}