import { createClient } from '@supabase/supabase-js';
import { SUBCATEGORIAS_FLAT } from '../../../../utils/catalogoFornecedores';

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Metodo ${req.method} nao permitido` });
  }
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Configuracao do Supabase incompleta' });
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticacao nao fornecido' });
  }
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Token invalido' });
  }
  const { data: cerimonialista, error: cerimError } = await supabase
    .from('cerimonialistas').select('id').eq('usuario_id', user.id).single();
  if (cerimError || !cerimonialista) {
    return res.status(403).json({ error: 'Usuario nao e cerimonialista' });
  }
  try {
    const { evento_id, tipo, categoria, descricao, valor, data_vencimento, pago } = req.body;
    if (!tipo || !valor) {
      return res.status(400).json({ error: 'Tipo e valor sao obrigatorios' });
    }
    const catValidada = validarCategoria(categoria);
    if (catValidada && typeof catValidada === 'object' && catValidada.erro) {
      return res.status(400).json({ error: catValidada.erro });
    }
    const { data, error } = await supabase.from('cerimonialista_financeiro').insert({
      cerimonialista_id: cerimonialista.id,
      evento_id: evento_id || null,
      tipo,
      categoria: catValidada,
      descricao: descricao?.trim() || null,
      valor: parseFloat(valor),
      data_vencimento: data_vencimento || null,
      pago: pago || false,
    }).select().single();
    if (error) throw error;
    return res.status(201).json({ lancamento: data });
  } catch (err) {
    console.error('[API financeiro/criar]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}