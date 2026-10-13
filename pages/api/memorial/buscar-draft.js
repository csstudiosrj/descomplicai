// pages/api/memorial/buscar-draft.js
/**
 * API Route — Busca draft anônimo do memorial pelo token
 * GET /api/memorial/buscar-draft?draft_id=xxx
 * Pública — sem autenticação (rate limited)
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin.js';
import { withRateLimit, strictLimiter } from '@/lib/rateLimit.js';

async function _handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  const { draft_id } = req.query;

  if (!draft_id) {
    return res.status(400).json({ error: 'draft_id obrigatorio' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('memoriais_draft')
      .select('estado, email, expira_em, criado_em')
      .eq('draft_token', draft_id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ sucesso: false, erro: 'Draft nao encontrado' });
    }

    // Valida expiração se a coluna existir na tabela
    if (data.expira_em && new Date(data.expira_em) < new Date()) {
      return res.status(410).json({ sucesso: false, erro: 'Draft expirado' });
    }

    // Fallback: rejeita drafts com mais de 48h caso expira_em nao exista
    if (!data.expira_em && data.criado_em) {
      const criado = new Date(data.criado_em);
      const limite = new Date(criado.getTime() + 48 * 60 * 60 * 1000);
      if (limite < new Date()) {
        return res.status(410).json({ sucesso: false, erro: 'Draft expirado' });
      }
    }

    return res.status(200).json({
      sucesso: true,
      estado: data.estado,
      email: data.email,
    });
  } catch (e) {
    console.error('[API memorial/buscar-draft]', e);
    return res.status(500).json({ sucesso: false, erro: e.message });
  }
}

export default withRateLimit(_handler, strictLimiter);