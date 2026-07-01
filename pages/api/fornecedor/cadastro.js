import { withRateLimit, cadastroLimiter } from "../../lib/ratelimit";
import { createClient } from '@supabase/supabase-js';
import { enviarEmailTemplate } from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/fornecedor/cadastro
 * Body: { email, senha, nome_fantasia, nome_responsavel, categoria, subcategoria, telefone, cnpj }
 * Cria usuário no Auth, perfil na tabela fornecedores com trial de 7 dias
 */
async function _handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const {
    email,
    senha,
    nome_fantasia,
    nome_responsavel,
    categoria,
    subcategoria,
    telefone,
    cnpj,
  } = req.body;

  // Validações básicas
  if (!email || !senha || !nome_fantasia || !nome_responsavel || !categoria || !subcategoria) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
  }

  // Verifica se e-mail já existe
  const { data: existente } = await supabaseAdmin
    .from('fornecedores')
    .select('id')
    .eq('email', email)
    .single();

  if (existente) {
    return res.status(409).json({ error: 'E-mail já cadastrado' });
  }

  // Cria usuário no Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true, // Confirma e-mail automaticamente (ou false se quiser verificação)
  });

  if (authError) {
    return res.status(500).json({ error: 'Erro ao criar usuário', detalhe: authError.message });
  }

  const userId = authData.user.id;

  // Calcula trial: 7 dias a partir de agora
  const trialExpira = new Date();
  trialExpira.setDate(trialExpira.getDate() + 7);

  // Cria registro na tabela fornecedores
  const { data: fornecedor, error: insertError } = await supabaseAdmin
    .from('fornecedores')
    .insert({
      user_id: userId,
      email,
      nome_fantasia,
      nome_responsavel,
      categoria,
      subcategoria,
      telefone: telefone || null,
      cnpj: cnpj || null,
      status: 'trial',
      trial_expira_em: trialExpira.toISOString(),
      pagamento_status: 'pendente',
      plano: 'basico',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    // Rollback: deleta usuário do Auth
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return res.status(500).json({ error: 'Erro ao criar fornecedor', detalhe: insertError.message });
  }

  // Envia e-mail de boas-vindas (versão trial)
  const resultado = await enviarEmailTemplate(
    {
      para: email,
      template: 'bem_vindo_fornecedor',
      variaveis: {
        nome_fantasia,
        nome_responsavel,
        categoria,
        subcategoria,
        link_painel: `${process.env.NEXT_PUBLIC_SITE_URL}/fornecedor/painel`,
      },
    },
    supabaseAdmin
  );

  // Log do e-mail
  await supabaseAdmin.from('email_logs').insert({
    destinatario: email,
    template: 'bem_vindo_fornecedor',
    status: resultado.error ? 'erro' : 'enviado',
    erro: resultado.error?.message || null,
    provider_id: resultado.id || null,
  });

  return res.status(201).json({
    success: true,
    fornecedor: {
      id: fornecedor.id,
      email: fornecedor.email,
      nome_fantasia: fornecedor.nome_fantasia,
      status: fornecedor.status,
      trial_expira_em: fornecedor.trial_expira_em,
    },
    message: 'Cadastro realizado. Trial ativo por 7 dias.',
  });
}

// Rate limit: cadastroLimiter
export default withRateLimit(_handler, cadastroLimiter);
