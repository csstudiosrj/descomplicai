// pages/api/evento/trial.js — Inicia trial de 7 dias no painel
import { createClient } from '@supabase/supabase-js';
import { iniciarTrial } from '../../../utils/acesso';

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
      .select('acesso_iniciado_em, usuario_id')
      .eq('id', eventoId)
      .single();

    if (fetchError || !evento) {
      return res.status(404).json({ erro: 'Evento nao encontrado' });
    }

    if (evento.acesso_iniciado_em) {
      return res.status(400).json({ erro: 'Trial ja iniciado' });
    }

    const trial = iniciarTrial(evento);

    const { error: updateError } = await supabaseAdmin
      .from('eventos')
      .update(trial)
      .eq('id', eventoId);

    if (updateError) {
      throw updateError;
    }

    res.status(200).json({ sucesso: true, trial });
  } catch (erro) {
    console.error('Erro ao iniciar trial:', erro);
    res.status(500).json({ erro: 'Erro ao iniciar trial' });
  }
}
