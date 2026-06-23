import { createClient } from '@supabase/supabase-js';
import { gerarTarefasContextualizadas } from '../../../utils/gerador-tarefas';
import { TAREFAS_PADRAO } from '../../../utils/tarefasPadrao';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { evento_id, data_evento, usuario_id, forcar_regeneracao } = req.body;

  if (!evento_id || !data_evento) {
    return res.status(400).json({ erro: 'evento_id e data_evento são obrigatórios' });
  }

  const key = serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, key);

  try {
    // 1. Resolve usuario_id se não veio no body
    let uid = usuario_id;
    if (!uid) {
      const { data: evt } = await supabase
        .from('eventos')
        .select('usuario_id')
        .eq('id', evento_id)
        .single();
      uid = evt?.usuario_id;
    }
    if (!uid) {
      return res.status(400).json({ erro: 'usuario_id não encontrado' });
    }

    // 2. Se NÃO for forçado, verifica se já existem tarefas auto-geradas
    if (!forcar_regeneracao) {
      const { data: existentes, error: errCheck } = await supabase
        .from('tarefas')
        .select('id')
        .eq('evento_id', evento_id)
        .eq('gerada_auto', true)
        .limit(1);

      if (errCheck) throw errCheck;
      if (existentes && existentes.length > 0) {
        return res.status(200).json({ sucesso: true, criadas: 0, mensagem: 'Tarefas já existem' });
      }
    }

    // 3. Busca memorial do evento para contextualização
    const { data: memorial, error: memErr } = await supabase
      .from('memoriais')
      .select('estado')
      .eq('evento_id', evento_id)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (memErr) console.error('[gerar-tarefas] Erro ao buscar memorial:', memErr);

    let tarefasParaInserir = [];

    // 4. Se tiver estado no memorial, usa gerador contextualizado
    if (memorial?.estado) {
      const estado = typeof memorial.estado === 'string' ? JSON.parse(memorial.estado) : memorial.estado;
      const contextualizadas = gerarTarefasContextualizadas(estado, data_evento);

      tarefasParaInserir = contextualizadas.map((t) => ({
        evento_id,
        usuario_id: uid,
        titulo: t.titulo,
        descricao: t.descricao,
        categoria: t.categoria,
        categoria_principal: t.categoria_principal,
        prazo: t.prazo,
        concluida: t.concluida,
        gerada_auto: true,
        prioridade: t.prioridade,
      }));
    }

    // 5. Fallback: se não gerou nada contextualizado, usa tarefas padrão
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
          categoria: t.categoria,
          prazo: dataPrazo.toISOString().split('T')[0],
          concluida: false,
          gerada_auto: true,
        };
      });
    }

    // 6. Se for regeneração, remove tarefas antigas auto-geradas primeiro
    if (forcar_regeneracao) {
      const { error: delErr } = await supabase
        .from('tarefas')
        .delete()
        .eq('evento_id', evento_id)
        .eq('gerada_auto', true);
      if (delErr) console.error('[gerar-tarefas] Erro ao deletar antigas:', delErr);
    }

    // 7. Insere novas tarefas
    const { error } = await supabase.from('tarefas').insert(tarefasParaInserir);
    if (error) throw error;

    return res.status(201).json({
      sucesso: true,
      criadas: tarefasParaInserir.length,
      contextualizadas: tarefasParaInserir[0]?.categoria_principal !== undefined,
    });
  } catch (err) {
    console.error('[gerar-tarefas]', err);
    return res.status(500).json({ erro: 'Erro ao gerar tarefas', detalhe: err.message });
  }
}