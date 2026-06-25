import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} não permitido` });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Configuração do Supabase incompleta' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  const { token: eventoToken } = req.body;

  if (!eventoToken) {
    return res.status(400).json({ error: 'Token do evento é obrigatório' });
  }

  try {
    const { data: evento, error: eventoError } = await supabase
      .from('eventos')
      .select('id, cerimonialista_id, casal_confirmado, convite_revogado, usuario_id')
      .eq('id', eventoToken)
      .single();

    if (eventoError || !evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    if (!evento.cerimonialista_id) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    if (evento.convite_revogado) {
      return res.status(410).json({ error: 'Convite revogado' });
    }

    if (evento.casal_confirmado) {
      return res.status(409).json({ error: 'Convite já foi aceito', status: 'ja_confirmado' });
    }

    const { error: updError } = await supabase
      .from('eventos')
      .update({
        usuario_id: user.id,
        casal_confirmado: true,
        status: 'ativo',
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', evento.id);

    if (updError) throw updError;

    // Notificar cerimonialista (defensivo)
    let cerimUsuarioId = null;
    try {
      const { data: cerimData } = await supabase
        .from('cerimonialistas')
        .select('usuario_id')
        .eq('id', evento.cerimonialista_id)
        .single();
      if (cerimData) cerimUsuarioId = cerimData.usuario_id;
    } catch (e) { /* ignora */ }

    if (cerimUsuarioId) {
      try {
        await supabase.from('notificacoes').insert({
          usuario_id: cerimUsuarioId,
          tipo: 'convite_aceito',
          mensagem: 'O casal aceitou o convite e agora está vinculado ao evento.',
          lida: false,
          criado_em: new Date().toISOString(),
        });
      } catch (notifErr) {
        console.log('[convite/aceitar] notificação não enviada:', notifErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      redirect_url: '/painel',
    });
  } catch (err) {
    console.error('[API convite/aceitar]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
