import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ erro: 'Método não permitido' });
    }

    const { token: tokenQuery } = req.query;
    if (!tokenQuery) {
      return res.status(400).json({ erro: 'Token obrigatório' });
    }

    const { data, error } = await supabaseAdmin
      .from('contratos')
      .select('*, fornecedores(nome, email)')
      .eq('token_assinatura', tokenQuery)
      .single();

    if (error || !data) {
      return res.status(404).json({ erro: 'Contrato não encontrado' });
    }

    return res.status(200).json({ contrato: data });
  } catch (error) {
    console.error('Erro em contratos/ver:', error.message);
    return res.status(500).json({
      erro: 'Erro interno do servidor. Tente novamente.',
    });
  }
}
