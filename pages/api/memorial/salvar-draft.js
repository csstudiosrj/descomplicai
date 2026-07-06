// pages/api/memorial/salvar-draft.js
/**
 * API Route — Salva draft anônimo do memorial antes do cadastro
 * POST /api/memorial/salvar-draft
 * Body: { estado: Object, email?: string }
 * Pública — sem autenticação (rate limited)
 */

import { createClient } from '@supabase/supabase-js';
import { withRateLimit, strictLimiter } from '@/lib/rateLimit.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function _handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  const { estado, email } = req.body;

  if (!estado || typeof estado !== 'object') {
    return res.status(400).json({ error: 'Estado invalido' });
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabaseAdmin
      .from('memoriais_draft')
      .insert({
        estado,
        email: email || null,
      })
      .select('draft_token')
      .single();

    if (error) throw error;

    return res.status(200).json({
      sucesso: true,
      draft_token: data.draft_token,
    });
  } catch (e) {
    console.error('[API memorial/salvar-draft]', e);
    return res.status(500).json({ sucesso: false, erro: e.message });
  }
}

export default withRateLimit(_handler, strictLimiter);
