import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'Token ausente' });
  }

  try {
    // Verificar o token e extrair o usuario_id
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Token invalido' });
    }

    // Verificar se o usuario e admin na tabela admins (bypass RLS via service_role)
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('usuario_id', user.id)
      .single();

    if (adminError || !adminData) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // E admin
    return res.status(200).json({ isAdmin: true, userId: user.id });
  } catch (err) {
    console.error('[admin/verificar] Erro:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}