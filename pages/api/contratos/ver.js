import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ erro: 'Token obrigatório' });
  }

  try {
    const { data, error } = await supabase
      .from('contratos')
      .select('*, fornecedores(nome, email)')
      .eq('token_assinatura', token)
      .single();

    if (error || !data) {
      return res.status(404).json({ erro: 'Contrato não encontrado' });
    }

    return res.status(200).json({ contrato: data });
  } catch (err) {
    console.error('Erro ao buscar contrato:', err);
    return res.status(500).json({ erro: err.message || 'Erro interno' });
  }
}