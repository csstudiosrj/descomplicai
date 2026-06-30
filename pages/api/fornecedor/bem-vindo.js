import { createClient } from '@supabase/supabase-js';
import { enviarEmailTemplate } from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/fornecedor/bem-vindo
 * Body: { fornecedor_id }
 * Chamado automaticamente após aprovação no admin
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { fornecedor_id } = req.body;
  if (!fornecedor_id) {
    return res.status(400).json({ error: 'fornecedor_id obrigatório' });
  }

  const { data: fornecedor, error } = await supabaseAdmin
    .from('fornecedores')
    .select('id, email, nome_fantasia, nome_responsavel, categoria, subcategoria')
    .eq('id', fornecedor_id)
    .single();

  if (error || !fornecedor) {
    return res.status(404).json({ error: 'Fornecedor não encontrado' });
  }

  const linkPainel = `${process.env.NEXT_PUBLIC_SITE_URL}/fornecedor/painel`;

  const resultado = await enviarEmailTemplate(
    {
      para: fornecedor.email,
      template: 'bem_vindo_fornecedor',
      variaveis: {
        nome_fantasia: fornecedor.nome_fantasia,
        nome_responsavel: fornecedor.nome_responsavel,
        categoria: fornecedor.categoria,
        subcategoria: fornecedor.subcategoria,
        link_painel: linkPainel,
      },
    },
    supabaseAdmin
  );

  await supabaseAdmin.from('email_logs').insert({
    destinatario: fornecedor.email,
    template: 'bem_vindo_fornecedor',
    status: resultado.error ? 'erro' : 'enviado',
    erro: resultado.error?.message || null,
    provider_id: resultado.id || null,
  });

  if (resultado.error) {
    return res.status(500).json({ error: 'Falha ao enviar e-mail', detalhe: resultado.error.message });
  }

  return res.status(200).json({ success: true, message: 'E-mail de boas-vindas enviado' });
}
