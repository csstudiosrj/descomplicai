import { withRateLimit, conviteLimiter } from '@/lib/rateLimit.js';
import { enviarEmailTemplate } from '@/lib/email';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/colaborador/convidar
 * Body: { email, perfil_id, funcao }
 * Envia e-mail de convite + cria registro na tabela colaboradores
 */
async function _handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Autenticação: verifica token do casal
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  const { email, perfil_id, funcao } = req.body;
  if (!email || !perfil_id) {
    return res.status(400).json({ error: 'Campos obrigatórios: email, perfil_id' });
  }

  // Busca dados do casal
  const { data: perfil } = await supabaseAdmin
    .from('perfis')
    .select('nome1, nome2, data_casamento')
    .eq('id', perfil_id)
    .single();

  const casalNome = perfil ? `${perfil.nome1} e ${perfil.nome2}` : 'Um casal';
  const linkConvite = `${process.env.NEXT_PUBLIC_SITE_URL}/convite?token=${token}&perfil=${perfil_id}`;

  // Insere convite na tabela
  const { data: convite, error: insertErr } = await supabaseAdmin
    .from('colaboradores')
    .insert({
      perfil_id,
      email,
      funcao: funcao || 'colaborador',
      status: 'pendente',
      convidado_por: user.id,
    })
    .select()
    .single();

  if (insertErr) {
    return res.status(500).json({ error: 'Erro ao criar convite', detalhe: insertErr.message });
  }

  // Envia e-mail
  const resultado = await enviarEmailTemplate(
    {
      para: email,
      template: 'convite_colaborador',
      variaveis: {
        casal: casalNome,
        funcao: funcao || 'colaborador',
        link: linkConvite,
        data_casamento: perfil?.data_casamento
          ? new Date(perfil.data_casamento).toLocaleDateString('pt-BR')
          : '',
      },
    },
    supabaseAdmin
  );

  // Log
  await supabaseAdmin.from('email_logs').insert({
    destinatario: email,
    template: 'convite_colaborador',
    status: resultado.error ? 'erro' : 'enviado',
    erro: resultado.error?.message || null,
    provider_id: resultado.id || null,
  });

  if (resultado.error) {
    return res.status(500).json({
      error: 'Convite criado, mas falha ao enviar e-mail',
      convite,
      detalhe: resultado.error.message,
    });
  }

  return res.status(200).json({ success: true, convite, email_id: resultado.id });
}

// Rate limit: conviteLimiter
export default withRateLimit(_handler, conviteLimiter);
