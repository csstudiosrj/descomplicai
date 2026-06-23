import { createClient } from '@supabase/supabase-js';
import { TAREFAS_PADRAO } from '../../../utils/tarefasPadrao';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { evento_id, data_evento } = req.body;

  if (!evento_id || !data_evento) {
    return res.status(400).json({ erro: 'evento_id e data_evento são obrigatórios' });
  }

  try {
    // Verifica se já existem tarefas geradas automaticamente para este evento
    const { data: existentes } = await supabase
      .from('tarefas')
      .select('id')
      .eq('evento_id', evento_id)
      .eq('gerada_auto', true)
      .limit(1);

    if (existentes && existentes.length > 0) {
      return res.status(200).json({ sucesso: true, criadas: 0, mensagem: 'Tarefas já existem' });
    }

    // Calcula datas reais subtraindo diasAntes da data do evento
    const dataEvento = new Date(data_evento + 'T00:00:00');

    const tarefasParaInserir = TAREFAS_PADRAO.map((t) => {
      const dataPrazo = new Date(dataEvento);
      dataPrazo.setDate(dataPrazo.getDate() - t.diasAntes);
      const prazoStr = dataPrazo.toISOString().split('T')[0];

      return {
        evento_id,
        usuario_id: null, // será preenchido pelo RLS ou pelo client
        titulo: t.titulo,
        descricao: t.descricao,
        categoria: t.categoria,
        prazo: prazoStr,
        concluida: false,
        gerada_auto: true,
      };
    });

    const { error } = await supabase
      .from('tarefas')
      .insert(tarefasParaInserir);

    if (error) throw error;

    return res.status(201).json({ sucesso: true, criadas: tarefasParaInserir.length });
  } catch (err) {
    console.error('[gerar-tarefas]', err);
    return res.status(500).json({ erro: 'Erro ao gerar tarefas', detalhe: err.message });
  }
}