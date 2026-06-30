import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ erro: 'Token inválido' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[API Colaborador] Variáveis de ambiente do Supabase não configuradas');
    return res.status(500).json({
      valido: false,
      erro: 'Erro interno de configuração do servidor',
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  try {
    // ── Tenta tabela colaboradores ───────────────────────
    let { data, error } = await supabaseAdmin
      .from('colaboradores')
      .select('id, nome, email, evento_id, ativo, expira_em')
      .eq('token', token)
      .eq('ativo', true)
      .gt('expira_em', new Date().toISOString())
      .single();

    // ── Fallback: convites_acesso ────────────────────────
    if (!data && error) {
      const result = await supabaseAdmin
        .from('convites_acesso')
        .select('id, nome, email, evento_id, ativo, expira_em')
        .eq('token', token)
        .eq('ativo', true)
        .gt('expira_em', new Date().toISOString())
        .single();

      data = result.data;
      error = result.error;
    }

    if (!data || error) {
      return res.status(401).json({
        valido: false,
        erro: 'Token inválido, inativo ou expirado',
      });
    }

    return res.status(200).json({ valido: true, colaborador: data });
  } catch (err) {
    console.error('[API Colaborador] erro ao validar token:', err);
    return res.status(500).json({
      valido: false,
      erro: 'Erro interno ao validar token',
    });
  }
}
