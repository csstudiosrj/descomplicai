import { createClient } from '@supabase/supabase-js';
import { enviarEmailTemplate } from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/auth/recuperar-senha
 * Body: { email }
 * Gera link de recuperação via Supabase Auth e envia e-mail customizado
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'E-mail obrigatório' });
  }

  // Gera link de recuperação via Supabase Auth
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/redefinir-senha`,
    },
  });

  if (error) {
    return res.status(500).json({ error: 'Erro ao gerar link', detalhe: error.message });
  }

  const link = data.properties?.action_link;

  // Envia e-mail customizado
  const resultado = await enviarEmailTemplate(
    {
      para: email,
      template: 'recuperacao_senha',
      variaveis: {
        email,
        link,
        expira_em: '60 minutos',
      },
    },
    supabaseAdmin
  );

  // Log
  await supabaseAdmin.from('email_logs').insert({
    destinatario: email,
    template: 'recuperacao_senha',
    status: resultado.error ? 'erro' : 'enviado',
    erro: resultado.error?.message || null,
    provider_id: resultado.id || null,
  });

  if (resultado.error) {
    return res.status(500).json({
      error: 'Link gerado, mas falha ao enviar e-mail',
      detalhe: resultado.error.message,
    });
  }

  return res.status(200).json({ success: true, message: 'E-mail de recuperação enviado' });
}
