import { createClient } from '@supabase/supabase-js';
import { iniciarTrial } from '../../utils/acesso';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Metodo nao permitido' });
  }

  const { eventoId } = req.body;

  if (!eventoId) {
    return res.status(400).json({ erro: 'eventoId obrigatorio' });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data: evento, error: fetchError } = await supabaseAdmin
      .from('eventos')
      .select('acesso_iniciado_em')
      .eq('id', eventoId)
      .single();

    if (fetchError || !evento) {
      return res.status(404).json({ erro: 'Evento nao encontrado' });
    }

    if (evento.acesso_iniciado_em) {
      return res.status(400).json({ erro: 'Trial ja iniciado para este evento' });
    }

    const trial = iniciarTrial(evento);

    const { error: updateError } = await supabaseAdmin
      .from('eventos')
      .update({
        acesso_iniciado_em: trial.acesso_iniciado_em,
        acesso_expira_em: trial.acesso_expira_em,
        plano: trial.plano,
      })
      .eq('id', eventoId);

    if (updateError) {
      console.error('Erro ao iniciar trial:', updateError);
      return res.status(500).json({ erro: 'Erro ao iniciar trial' });
    }

    res.status(200).json({ sucesso: true });
  } catch (err) {
    console.error('Trial API erro:', err);
    res.status(500).json({ erro: 'Erro interno' });
  }
}