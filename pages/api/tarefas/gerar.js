import { createClient } from '@supabase/supabase-js';
import { gerarTarefasContextualizadas } from '../../../utils/gerador-tarefas';
import { TAREFAS_PADRAO } from '../../../utils/tarefasPadrao';
import { SUBCATEGORIAS_FLAT, CATALOGO_FORNECEDORES } from '../../../utils/catalogoFornecedores';
import { supabase } from '../../../lib/supabase';

const CATEGORIAS_VALIDAS = new Set(SUBCATEGORIAS_FLAT.map(s => s.id));
const CATEGORIAS_PRINCIPAIS_VALIDAS = new Set(CATALOGO_FORNECEDORES.map(c => c.id));

function normalizarCategoria(categoria) {
  if (!categoria) return null;
  const limpa = String(categoria).trim();
  if (!limpa) return null;
  if (CATEGORIAS_VALIDAS.has(limpa)) return limpa;
  return 'outro';
}

function normalizarCategoriaPrincipal(categoriaPrincipal) {
  if (!categoriaPrincipal) return null;
  const limpa = String(categoriaPrincipal).trim();
  if (!limpa) return null;
  if (CATEGORIAS_PRINCIPAIS_VALIDAS.has(limpa)) return limpa;
  return 'outro';
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
      return res.status(405).json({ erro: 'Metodo nao permitido' });
    }

    const { evento_id, data_evento, usuario_id, forcar_regeneracao } = req.body;

    if (!evento_id || !data_evento) {
      return res.status(400).json({ erro: 'evento_id e data_evento sao obrigatorios' });
    }

    const key = serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseAdmin = createClient(supabaseUrl, key);

    let uid = usuario_id;
    if (!uid) {
      const { data: evt } = await supabaseAdmin
        .from('eventos')
        .select('usuario_id')
        .eq('id', evento_id)
        .single();
      uid = evt?.usuario_id;
    }
    if (!uid) {
      return res.status(400).json({ erro: 'usuario_id nao encontrado' });
    }

    if (!forcar_regeneracao) {
      const { data: existentes, error: errCheck } = await supabaseAdmin
        .from('tarefas')
        .select('id')
        .eq('evento_id', evento_id)
        .eq('gerada_auto', true)
        .limit(1);

      if (errCheck) throw errCheck;
      if (existentes && existentes.length > 0) {
        return res.status(200).json({ sucesso: true, criadas: 0, mensagem: 'Tarefas ja existem' });
      }
    }

    const { data: memorial, error: memErr } = await supabaseAdmin
      .from('memoriais')
      .select('estado')
      .eq('evento_id', evento_id)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (memErr) console.error('[gerar-tarefas] Erro ao buscar memorial:', memErr);

    let tarefasParaInserir = [];

    if (memorial?.estado) {
      const estado = typeof memorial.estado === 'string' ? JSON.parse(memorial.estado) : memorial.estado;
      const contextualizadas = gerarTarefasContextualizadas(estado, data_evento);

      tarefasParaInserir = contextualizadas.map((t) => ({
        evento_id,
        usuario_id: uid,
        titulo: t.titulo,
        descricao: t.descricao,
        categoria: normalizarCategoria(t.categoria),
        categoria_principal: normalizarCategoriaPrincipal(t.categoria_principal),
        prazo: t.prazo,
        concluida: t.concluida,
        gerada_auto: true,
        prioridade: t.prioridade,
      }));
    }

    if (tarefasParaInserir.length === 0) {
      const dataEvento = new Date(data_evento + 'T00:00:00');

      tarefasParaInserir = TAREFAS_PADRAO.map((t) => {
        const dataPrazo = new Date(dataEvento);
        dataPrazo.setDate(dataPrazo.getDate() - t.diasAntes);
        return {
          evento_id,
          usuario_id: uid,
          titulo: t.titulo,
          descricao: t.descricao,
          categoria: normalizarCategoria(t.categoria),
          prazo: dataPrazo.toISOString().split('T')[0],
          concluida: false,
          gerada_auto: true,
        };
      });
    }

    if (forcar_regeneracao) {
      const { error: delErr } = await supabaseAdmin
        .from('tarefas')
        .delete()
        .eq('evento_id', evento_id)
        .eq('gerada_auto', true);
      if (delErr) console.error('[gerar-tarefas] Erro ao deletar antigas:', delErr);
    }

    const { error } = await supabaseAdmin.from('tarefas').insert(tarefasParaInserir);
    if (error) throw error;

    return res.status(201).json({
      sucesso: true,
      criadas: tarefasParaInserir.length,
      contextualizadas: tarefasParaInserir[0]?.categoria_principal !== undefined,
    });
  } catch (error) {
    console.error('Erro em tarefas/gerar:', error.message);
    return res.status(500).json({
      erro: 'Erro interno do servidor. Tente novamente.',
    });
  }
}
