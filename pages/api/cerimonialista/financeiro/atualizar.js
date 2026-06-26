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
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
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
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: 'ID do lancamento e obrigatorio' });
    const { data: existing, error: checkError } = await supabase
      .from('cerimonialista_financeiro').select('id')
      .eq('id', id).eq('cerimonialista_id', cerimonialista.id).single();
    if (checkError || !existing) {
      return res.status(403).json({ error: 'Lancamento nao encontrado ou sem permissao' });
    }
    const cleanUpdates = {};
    if (updates.evento_id !== undefined) cleanUpdates.evento_id = updates.evento_id || null;
    if (updates.tipo !== undefined) cleanUpdates.tipo = updates.tipo;
    if (updates.categoria !== undefined) {
      const catValidada = validarCategoria(updates.categoria);
      if (catValidada && typeof catValidada === 'object' && catValidada.erro) {
        return res.status(400).json({ error: catValidada.erro });
      }
      cleanUpdates.categoria = catValidada;
    }
    if (updates.descricao !== undefined) cleanUpdates.descricao = updates.descricao?.trim() || null;
    if (updates.valor !== undefined) cleanUpdates.valor = parseFloat(updates.valor);
    if (updates.data_vencimento !== undefined) cleanUpdates.data_vencimento = updates.data_vencimento || null;
    if (updates.pago !== undefined) cleanUpdates.pago = updates.pago;
    const { data, error } = await supabase.from('cerimonialista_financeiro')
      .update(cleanUpdates).eq('id', id).select().single();
    if (error) throw error;
    return res.status(200).json({ lancamento: data });
  } catch (err) {
    console.error('[API financeiro/atualizar]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}