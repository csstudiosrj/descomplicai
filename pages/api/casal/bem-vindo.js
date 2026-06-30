import { createClient } from '@supabase/supabase-js';
import { enviarEmailTemplate } from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/casal/bem-vindo
 * Body: { perfil_id } ou chamado por trigger
 * Envia e-mail de boas-vindas após cadastro confirmado
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { perfil_id } = req.body;
  if (!perfil_id) {
    return res.status(400).json({ error: 'perfil_id obrigatório' });
  }

  // Busca dados do casal
  const { data: perfil, error: perfilErr } = await supabaseAdmin
    .from('perfis')
    .select('id, nome1, nome2, email, data_casamento')
    .eq('id', perfil_id)
    .single();

  if (perfilErr || !perfil) {
    return res.status(404).json({ error: 'Perfil não encontrado' });
  }

  const casalNome = `${perfil.nome1} e ${perfil.nome2}`;
  const linkPainel = `${process.env.NEXT_PUBLIC_SITE_URL}/painel`;

  const resultado = await enviarEmailTemplate(
    {
      para: perfil.email,
      template: 'bem_vindo_casal',
      variaveis: {
        casal: casalNome,
        nome1: perfil.nome1,
        nome2: perfil.nome2,
        data_casamento: perfil.data_casamento
          ? new Date(perfil.data_casamento).toLocaleDateString('pt-BR')
          : '',
        link_painel: linkPainel,
      },
    },
    supabaseAdmin
  );

  await supabaseAdmin.from('email_logs').insert({
    destinatario: perfil.email,
    template: 'bem_vindo_casal',
    status: resultado.error ? 'erro' : 'enviado',
    erro: resultado.error?.message || null,
    provider_id: resultado.id || null,
  });

  if (resultado.error) {
    return res.status(500).json({ error: 'Falha ao enviar e-mail', detalhe: resultado.error.message });
  }

  return res.status(200).json({ success: true, message: 'E-mail de boas-vindas enviado' });
}
