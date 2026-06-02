/**
 * API Route — Persiste memorial no Supabase (validação server-side)
 * POST /api/memorial/salvar
 * Body: { estado: Object }
 * Headers: Authorization (JWT do Supabase)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autenticação necessária' });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Valida token e extrai user
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  const { estado } = req.body;
  if (!estado || typeof estado !== 'object') {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    const { error } = await supabaseAdmin
      .from('memoriais')
      .upsert(
        {
          user_id: user.id,
          estado,
          atualizado_em: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) throw error;

    return res.status(200).json({ sucesso: true });
  } catch (e) {
    console.error('[API memorial/salvar]', e);
    return res.status(500).json({ sucesso: false, erro: e.message });
  }
}