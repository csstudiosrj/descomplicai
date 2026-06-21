// pages/api/fornecedores/sincronizar.js
// Sincroniza fornecedor com financeiro — chamado quando status muda para contratado/pago
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

  const { fornecedor } = req.body;

  if (!fornecedor || !fornecedor.id) {
    return res.status(400).json({ error: 'fornecedor obrigatorio' });
  }

  try {
    const resultado = await sincronizarFornecedorComFinanceiro(fornecedor, supabaseAdmin);
    return res.status(200).json(resultado);
  } catch (err) {
    console.error('Erro ao sincronizar financeiro:', err);
    return res.status(500).json({ error: err.message });
  }
}