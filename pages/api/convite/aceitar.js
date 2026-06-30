import { createClient } from '@supabase/supabase-js';
import { trackServerEvent } from '../../../utils/trackServerEvent';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { token, usuario_id } = req.body;
  if (!token || !usuario_id) {
    return res.status(400).json({ erro: 'Token e usuario_id são obrigatórios' });
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: convite, error } = await supabaseAdmin
      .from('convites')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !convite) {
      return res.status(404).json({ erro: 'Convite não encontrado' });
    }

    if (convite.usado_em) {
      return res.status(400).json({ erro: 'Convite já foi utilizado' });
    }

    // Marca como usado
    const { error: updateError } = await supabaseAdmin
      .from('convites')
      .update({ usado_em: new Date().toISOString(), usuario_id_convidado: usuario_id })
      .eq('id', convite.id);

    if (updateError) {
      console.error('[convite/aceitar] erro ao atualizar:', updateError);
      return res.status(500).json({ erro: 'Erro ao aceitar convite' });
    }

    // Track analytics
    await trackServerEvent({
      tipo: 'acao',
      categoria: 'auth',
      acao: 'convite_aceito',
      usuario_id,
      evento_id: convite.evento_id,
      req,
    });

    return res.status(200).json({ sucesso: true });
  } catch (err) {
    console.error('[convite/aceitar] erro:', err);
    return res.status(500).json({ erro: 'Erro interno' });
  }
}
