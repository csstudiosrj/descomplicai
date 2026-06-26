import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { evento_id, fornecedor_id, tipo, categoria, conteudo } = req.body;

  if (!evento_id || !fornecedor_id || !tipo || !conteudo) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  try {
    const { data, error } = await supabase
      .from('contratos')
      .insert({
        evento_id,
        fornecedor_id,
        tipo,
        categoria,
        status: 'rascunho',
        conteudo,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ contrato: data });
  } catch (err) {
    console.error('Erro ao criar contrato:', err);
    return res.status(500).json({ erro: err.message || 'Erro interno' });
  }
}