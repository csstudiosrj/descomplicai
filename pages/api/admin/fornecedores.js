import { createClient } from '@supabase/supabase-js';
import { enviarEmailTemplate } from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/admin/fornecedores
 * Lista fornecedores pendentes de aprovação
 * 
 * POST /api/admin/fornecedores
 * Body: { fornecedor_id, acao: 'aprovar' | 'reprovar', motivo? }
 * Aprova ou reprova fornecedor
 */
export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Autentica admin
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Token inválido' });

    // Verifica se é admin (ajuste conforme sua lógica de roles)
    const { data: profile } = await supabaseAdmin
      .from('perfis')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito a administradores' });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from('fornecedores')
      .select('id, email, nome_fantasia, nome_responsavel, categoria, subcategoria, status, pagamento_status, trial_expira_em, created_at, aprovado_em, aprovado_por', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: 'Erro ao buscar fornecedores', detalhe: error.message });
    }

    return res.status(200).json({
      success: true,
      fornecedores: data,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  if (req.method === 'POST') {
    const { fornecedor_id, acao, motivo } = req.body;

    if (!fornecedor_id || !acao) {
      return res.status(400).json({ error: 'fornecedor_id e acao são obrigatórios' });
    }

    if (!['aprovar', 'reprovar'].includes(acao)) {
      return res.status(400).json({ error: 'Ação deve ser "aprovar" ou "reprovar"' });
    }

    // Autentica admin
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Token inválido' });

    const { data: profile } = await supabaseAdmin
      .from('perfis')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito a administradores' });
    }

    // Busca fornecedor
    const { data: fornecedor } = await supabaseAdmin
      .from('fornecedores')
      .select('id, email, nome_fantasia, nome_responsavel, status, pagamento_status')
      .eq('id', fornecedor_id)
      .single();

    if (!fornecedor) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    if (acao === 'aprovar') {
      // Só aprova se pagamento estiver pago ou em trial
      if (fornecedor.pagamento_status !== 'pago' && fornecedor.status !== 'trial') {
        return res.status(400).json({
          error: 'Fornecedor não pode ser aprovado. Pagamento pendente ou status inválido.',
          pagamento_status: fornecedor.pagamento_status,
          status: fornecedor.status,
        });
      }

      const { error: updateErr } = await supabaseAdmin
        .from('fornecedores')
        .update({
          status: 'aprovado',
          aprovado_em: new Date().toISOString(),
          aprovado_por: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', fornecedor_id);

      if (updateErr) {
        return res.status(500).json({ error: 'Erro ao aprovar', detalhe: updateErr.message });
      }

      // Envia e-mail de boas-vindas aprovado
      const resultado = await enviarEmailTemplate(
        {
          para: fornecedor.email,
          template: 'bem_vindo_fornecedor',
          variaveis: {
            nome_fantasia: fornecedor.nome_fantasia,
            nome_responsavel: fornecedor.nome_responsavel,
            link_painel: `${process.env.NEXT_PUBLIC_SITE_URL}/fornecedor/painel`,
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

      return res.status(200).json({
        success: true,
        message: 'Fornecedor aprovado com sucesso',
        fornecedor_id,
      });
    }

    if (acao === 'reprovar') {
      const { error: updateErr } = await supabaseAdmin
        .from('fornecedores')
        .update({
          status: 'reprovado',
          updated_at: new Date().toISOString(),
        })
        .eq('id', fornecedor_id);

      if (updateErr) {
        return res.status(500).json({ error: 'Erro ao reprovar', detalhe: updateErr.message });
      }

      // Envia e-mail de reprovação (se tiver template)
      await enviarEmailTemplate(
        {
          para: fornecedor.email,
          template: 'reprovacao_fornecedor',
          variaveis: {
            nome_fantasia: fornecedor.nome_fantasia,
            motivo: motivo || 'Seu cadastro não atende aos critérios da plataforma.',
          },
        },
        supabaseAdmin
      );

      return res.status(200).json({
        success: true,
        message: 'Fornecedor reprovado',
        fornecedor_id,
      });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
