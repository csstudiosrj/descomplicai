import { createClient } from '@supabase/supabase-js';
import { CATALOGO_FORNECEDORES } from '@/utils/catalogoFornecedores';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CATEGORIAS_VALIDAS = CATALOGO_FORNECEDORES.map(c => c.id);

export default async function handler(req, res) {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    res.setHeader('Allow', ['POST', 'PUT', 'PATCH']);
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
    .from('cerimonialistas')
    .select('id')
    .eq('usuario_id', user.id)
    .single();

  if (cerimError || !cerimonialista) {
    return res.status(403).json({ error: 'Usuario nao e cerimonialista' });
  }

  try {
    const {
      id,
      nome_fornecedor,
      categoria,
      telefone,
      email,
      instagram,
      notas_internas,
      fornecedor_id,
    } = req.body;

    if (!nome_fornecedor?.trim()) {
      return res.status(400).json({ error: 'Nome do fornecedor e obrigatorio' });
    }

    // Validar categoria contra catalogo
    const categoriaLimpa = categoria?.trim() || 'outro';
    if (!CATEGORIAS_VALIDAS.includes(categoriaLimpa)) {
      return res.status(400).json({ error: 'Categoria invalida' });
    }

    const payload = {
      cerimonialista_id: cerimonialista.id,
      nome_fornecedor: nome_fornecedor.trim(),
      categoria: categoriaLimpa,
      telefone: telefone?.trim() || null,
      email: email?.trim() || null,
      instagram: instagram?.trim() || null,
      notas_internas: notas_internas?.trim() || null,
      fornecedor_id: fornecedor_id || null,
    };

    if (req.method === 'POST') {
      // Criar
      const { data, error } = await supabase
        .from('cerimonialista_fornecedores_favoritos')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ favorito: data });
    } else {
      // Atualizar
      if (!id) {
        return res.status(400).json({ error: 'ID do favorito e obrigatorio para atualizacao' });
      }

      // Verificar se o favorito pertence ao cerimonialista
      const { data: existente } = await supabase
        .from('cerimonialista_fornecedores_favoritos')
        .select('id')
        .eq('id', id)
        .eq('cerimonialista_id', cerimonialista.id)
        .single();

      if (!existente) {
        return res.status(403).json({ error: 'Favorito nao encontrado ou nao pertence a voce' });
      }

      delete payload.cerimonialista_id;

      const { data, error } = await supabase
        .from('cerimonialista_fornecedores_favoritos')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ favorito: data });
    }
  } catch (err) {
    console.error('[API favoritos/salvar]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
