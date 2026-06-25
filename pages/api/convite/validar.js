import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Método ${req.method} não permitido` });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Configuração do Supabase incompleta' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Token é obrigatório' });
  }

  try {
    const { data: evento, error: eventoError } = await supabase
      .from('eventos')
      .select('id, nome_evento, data_evento, cidade, cerimonialista_id, casal_confirmado, convite_revogado')
      .eq('id', token)
      .single();

    if (eventoError || !evento) {
      return res.status(404).json({ error: 'Convite não encontrado' });
    }

    if (!evento.cerimonialista_id) {
      return res.status(404).json({ error: 'Convite não encontrado' });
    }

    if (evento.convite_revogado) {
      return res.status(410).json({ error: 'Convite revogado' });
    }

    const { data: cerimonialista, error: cerimError } = await supabase
      .from('cerimonialistas')
      .select('id, nome_empresa, cidade, estado')
      .eq('id', evento.cerimonialista_id)
      .single();

    if (cerimError) {
      console.error('[validar] erro ao buscar cerimonialista:', cerimError);
    }

    return res.status(200).json({
      evento: {
        id: evento.id,
        nome_evento: evento.nome_evento,
        data_evento: evento.data_evento,
        cidade: evento.cidade,
        casal_confirmado: evento.casal_confirmado,
      },
      cerimonialista: cerimonialista || null,
      status: evento.casal_confirmado ? 'ja_confirmado' : 'pendente',
    });
  } catch (err) {
    console.error('[API convite/validar]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
