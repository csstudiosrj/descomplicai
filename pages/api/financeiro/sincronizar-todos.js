import { createClient } from '@supabase/supabase-js';
import { sincronizarFornecedorComFinanceiro } from '../../../utils/sincronizarFinanceiro';
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
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { evento_id } = req.body;

    if (!evento_id) {
      return res.status(400).json({ error: 'evento_id obrigatorio' });
    }

    const { data: fornecedores, error } = await supabaseAdmin
      .from('fornecedores')
      .select('*')
      .eq('evento_id', evento_id)
      .in('status', ['contratado', 'pago']);

    if (error) throw error;

    const resultados = [];
    for (const f of (fornecedores || [])) {
      const resultado = await sincronizarFornecedorComFinanceiro(f, supabaseAdmin);
      resultados.push({ fornecedorId: f.id, ...resultado });
    }

    return res.status(200).json({
      sincronizados: resultados.length,
      detalhes: resultados
    });
  } catch (error) {
    console.error('Erro em financeiro/sincronizar-todos:', error.message);
    return res.status(500).json({
      error: 'Erro interno do servidor. Tente novamente.',
    });
  }
}
