// pages/api/financeiro/sincronizar-todos.js
// Sincroniza TODOS os fornecedores contratados/pagos de um evento em lote
import { createClient } from '@supabase/supabase-js';
import { sincronizarFornecedorComFinanceiro } from '../../../utils/sincronizarFinanceiro';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { evento_id } = req.body;

  if (!evento_id) {
    return res.status(400).json({ error: 'evento_id obrigatorio' });
  }

  try {
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
  } catch (err) {
    console.error('Erro ao sincronizar lote:', err);
    return res.status(500).json({ error: err.message });
  }
}