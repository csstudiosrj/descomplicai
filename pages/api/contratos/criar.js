import { withRateLimit, pagamentoLimiter } from '@/lib/rateLimit.js';
import { createClient } from '@supabase/supabase-js';
import { SUBCATEGORIAS_FLAT } from '../../../utils/catalogoFornecedores';
import { supabase } from '../../../lib/supabase';

const CATEGORIAS_VALIDAS = new Set(SUBCATEGORIAS_FLAT.map(s => s.id));

function validarCategoria(categoria) {
  if (!categoria) return null;
  const limpa = categoria.trim();
  if (!limpa) return null;
  if (!CATEGORIAS_VALIDAS.has(limpa)) {
    return { erro: `Categoria invalida: "${limpa}"` };
  }
  return limpa;
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function _handler(req, res) {
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
      return res.status(405).json({ erro: 'Metodo nao permitido' });
    }

    const { evento_id, fornecedor_id, tipo, categoria, conteudo } = req.body;

    if (!evento_id || !fornecedor_id || !tipo || !conteudo) {
      return res.status(400).json({ erro: 'Dados incompletos' });
    }

    const catValidada = validarCategoria(categoria);
    if (catValidada && typeof catValidada === 'object' && catValidada.erro) {
      return res.status(400).json({ erro: catValidada.erro });
    }

    const { data, error } = await supabaseAdmin
      .from('contratos')
      .insert({
        evento_id,
        fornecedor_id,
        tipo,
        categoria: catValidada,
        status: 'rascunho',
        conteudo,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ contrato: data });
  } catch (error) {
    console.error('Erro em contratos/criar:', error.message);
    return res.status(500).json({
      erro: 'Erro interno do servidor. Tente novamente.',
    });
  }
}

// Rate limit: pagamentoLimiter
export default withRateLimit(_handler, pagamentoLimiter);
