import { createClient } from '@supabase/supabase-js';
import { trackServerEvent } from '../../../utils/trackServerEvent';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Metodo nao permitido.' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ erro: 'Configuracao do servidor incompleta.' });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    nome_empresa,
    categoria,
    cidade,
    estado,
    email,
    telefone,
    site,
    instagram,
    descricao,
    senha,
  } = req.body;

  if (!nome_empresa || !categoria || !cidade || !estado || !email || !telefone || !senha) {
    return res.status(400).json({ erro: 'Campos obrigatorios nao preenchidos.' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter no minimo 6 caracteres.' });
  }

  try {
    const { data: existingUser } = await supabaseAdmin
      .from('fornecedores_plataforma')
      .select('id')
      .eq('nome_empresa', nome_empresa)
      .limit(1);

    if (existingUser && existingUser.length > 0) {
      return res.status(409).json({ erro: 'Ja existe uma empresa com este nome cadastrada.' });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome: nome_empresa, tipo: 'fornecedor' },
    });

    if (authError) {
      if (authError.message && authError.message.includes('already been registered')) {
        return res.status(409).json({ erro: 'Este e-mail ja esta cadastrado.' });
      }
      console.error('Erro ao criar usuario no Auth:', authError);
      return res.status(500).json({ erro: 'Erro ao criar conta. Tente novamente.' });
    }

    const usuario_id = authData.user.id;

    const { error: insertError } = await supabaseAdmin.from('fornecedores_plataforma').insert({
      usuario_id,
      nome_empresa,
      categoria,
      cidade,
      estado,
      email,
      telefone: telefone || null,
      site: site || null,
      instagram: instagram || null,
      descricao: descricao || null,
      ativo: false,
      plano: 'gratuito',
      criado_em: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Erro ao inserir fornecedor:', insertError);
      await supabaseAdmin.auth.admin.deleteUser(usuario_id);
      return res.status(500).json({ erro: 'Erro ao salvar dados. Tente novamente.' });
    }

    // Track analytics
    await trackServerEvent({
      tipo: 'acao',
      categoria: 'auth',
      acao: 'cadastro_fornecedor',
      usuario_id,
      req,
    });

    return res.status(201).json({ sucesso: true });
  } catch (err) {
    console.error('Erro inesperado no cadastro de fornecedor:', err);
    return res.status(500).json({ erro: 'Erro interno. Tente novamente.' });
  }
}
