import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Metodo ${req.method} nao permitido` });
  }
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Configuracao do Supabase incompleta' });
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticacao nao fornecido' });
  }
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Token invalido' });
  }
  const { data: cerimonialista, error: cerimError } = await supabase
    .from('cerimonialistas').select('id').eq('usuario_id', user.id).single();
  if (cerimError || !cerimonialista) {
    return res.status(403).json({ error: 'Usuario nao e cerimonialista' });
  }
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID do lead e obrigatorio' });
    const { data: existing, error: checkError } = await supabase
      .from('cerimonialista_leads').select('*')
      .eq('id', id).eq('cerimonialista_id', cerimonialista.id).single();
    if (checkError || !existing) {
      return res.status(403).json({ error: 'Lead nao encontrado ou sem permissao' });
    }
    if (existing.convertido_evento_id) {
      return res.status(400).json({ error: 'Lead ja foi convertido' });
    }
    const { data: novoEvento, error: eventoError } = await supabase.from('eventos').insert({
      cerimonialista_id: cerimonialista.id,
      criado_por: 'cerimonialista',
      nome_evento: existing.nome_lead,
      data_evento: existing.data_prevista,
      orcamento: existing.valor_proposta || 0,
      status: 'rascunho',
      casal_confirmado: false,
      convite_revogado: false,
    }).select().single();
    if (eventoError) {
      console.error('[leads/converter] erro ao criar evento:', eventoError);
      return res.status(500).json({ error: 'Erro ao criar evento para o lead' });
    }
    const { data, error } = await supabase.from('cerimonialista_leads').update({
      estagio: 'contratado',
      convertido_evento_id: novoEvento.id,
      atualizado_em: new Date().toISOString(),
    }).eq('id', id).select().single();
    if (error) throw error;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://descomplicai.vercel.app';
      const linkConvite = `${baseUrl}/convite/${novoEvento.id}`;
      await supabase.from('notificacoes').insert({
        usuario_id: user.id,
        tipo: 'convite_enviado',
        mensagem: `Convite enviado para ${existing.nome_lead}: ${linkConvite}`,
        lida: true,
        criado_em: new Date().toISOString(),
      });
    } catch (emailErr) {

    }
    return res.status(200).json({ lead: data, evento: novoEvento });
  } catch (err) {
    console.error('[API leads/converter]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}