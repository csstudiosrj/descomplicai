// pages/api/memorial/salvar-draft.js
/**
 * API Route — Salva draft anônimo do memorial antes do cadastro
 * POST /api/memorial/salvar-draft
 * Body: { estado: Object, email?: string }
 * Pública — sem autenticação (rate limited)
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin.js';
import { withRateLimit, strictLimiter } from '@/lib/rateLimit.js';

async function _handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  const { estado, email } = req.body;

  if (!estado || typeof estado !== 'object') {
    return res.status(400).json({ error: 'Estado invalido' });
  }

  try {
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