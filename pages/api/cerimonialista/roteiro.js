import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  // Extrair token do header Authorization
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return res.status(401).json({ erro: 'Token ausente.' });
  }

  // Verificar sessão
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ erro: 'Sessão inválida.' });
  }

  // Buscar cerimonialista vinculado ao usuário
  const { data: cerim, error: cerimError } = await supabaseAdmin
    .from('cerimonialistas')
    .select('id')
    .eq('usuario_id', user.id)
    .single();

  if (cerimError || !cerim) {
    return res.status(403).json({ erro: 'Usuário não é cerimonialista.' });
  }

  const cerimonialistaId = cerim.id;

  try {
    // ─── GET ───────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const { evento_id } = req.query;
      if (!evento_id) {
        return res.status(400).json({ erro: 'evento_id obrigatório.' });
      }

      // Verificar se o evento pertence ao cerimonialista
      const { data: evento, error: evtError } = await supabaseAdmin
        .from('eventos')
        .select('id, cerimonialista_id, data_evento, tipo_cerimonia, tipo_local, status')
        .eq('id', evento_id)
        .single();

      if (evtError || !evento) {
        return res.status(404).json({ erro: 'Evento não encontrado.' });
      }

      if (evento.cerimonialista_id !== cerimonialistaId) {
        return res.status(403).json({ erro: 'Evento não pertence a este cerimonialista.' });
      }

      const { data: itens, error: itensError } = await supabaseAdmin
        .from('cerimonialista_roteiro_itens')
        .select('*')
        .eq('evento_id', evento_id)
        .eq('cerimonialista_id', cerimonialistaId)
        .order('ordem', { ascending: true })
        .order('horario', { ascending: true });

      if (itensError) {
        console.error('Erro ao buscar roteiro:', itensError);
        return res.status(500).json({ erro: 'Erro ao buscar roteiro.' });
      }

      return res.status(200).json({
        evento,
        itens: itens || [],
      });
    }

    // ─── POST ───────────────────────────────────────────────────────────
    if (req.method === 'POST') {
      const { evento_id, horario, titulo, descricao, responsavel, status, ordem } = req.body;

      if (!evento_id || !horario || !titulo) {
        return res.status(400).json({ erro: 'evento_id, horario e titulo são obrigatórios.' });
      }

      // Verificar evento
      const { data: evento, error: evtError } = await supabaseAdmin
        .from('eventos')
        .select('cerimonialista_id')
        .eq('id', evento_id)
        .single();

      if (evtError || !evento || evento.cerimonialista_id !== cerimonialistaId) {
        return res.status(403).json({ erro: 'Evento não autorizado.' });
      }

      // Calcular ordem automaticamente se não informada
      let ordemFinal = ordem;
      if (ordemFinal === undefined || ordemFinal === null) {
        const { data: maxOrdem } = await supabaseAdmin
          .from('cerimonialista_roteiro_itens')
          .select('ordem')
          .eq('evento_id', evento_id)
          .eq('cerimonialista_id', cerimonialistaId)
          .order('ordem', { ascending: false })
          .limit(1)
          .single();
        ordemFinal = (maxOrdem?.ordem || 0) + 1;
      }

      const { data, error } = await supabaseAdmin
        .from('cerimonialista_roteiro_itens')
        .insert({
          evento_id,
          cerimonialista_id: cerimonialistaId,
          horario,
          titulo,
          descricao: descricao || null,
          responsavel: responsavel || null,
          status: status || 'pendente',
          ordem: ordemFinal,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar item:', error);
        return res.status(500).json({ erro: 'Erro ao criar item do roteiro.' });
      }

      return res.status(201).json(data);
    }

    // ─── PUT ───────────────────────────────────────────────────────────
    if (req.method === 'PUT') {
      const { id, horario, titulo, descricao, responsavel, status, ordem } = req.body;

      if (!id) {
        return res.status(400).json({ erro: 'id obrigatório.' });
      }

      // Verificar se o item pertence ao cerimonialista
      const { data: itemExistente, error: itemError } = await supabaseAdmin
        .from('cerimonialista_roteiro_itens')
        .select('id, cerimonialista_id')
        .eq('id', id)
        .single();

      if (itemError || !itemExistente || itemExistente.cerimonialista_id !== cerimonialistaId) {
        return res.status(403).json({ erro: 'Item não autorizado.' });
      }

      const updateData = {};
      if (horario !== undefined) updateData.horario = horario;
      if (titulo !== undefined) updateData.titulo = titulo;
      if (descricao !== undefined) updateData.descricao = descricao;
      if (responsavel !== undefined) updateData.responsavel = responsavel;
      if (status !== undefined) updateData.status = status;
      if (ordem !== undefined) updateData.ordem = ordem;

      const { data, error } = await supabaseAdmin
        .from('cerimonialista_roteiro_itens')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar item:', error);
        return res.status(500).json({ erro: 'Erro ao atualizar item.' });
      }

      return res.status(200).json(data);
    }

    // ─── DELETE ─────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ erro: 'id obrigatório.' });
      }

      const { data: itemExistente, error: itemError } = await supabaseAdmin
        .from('cerimonialista_roteiro_itens')
        .select('id, cerimonialista_id, evento_id')
        .eq('id', id)
        .single();

      if (itemError || !itemExistente || itemExistente.cerimonialista_id !== cerimonialistaId) {
        return res.status(403).json({ erro: 'Item não autorizado.' });
      }

      const { error } = await supabaseAdmin
        .from('cerimonialista_roteiro_itens')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar item:', error);
        return res.status(500).json({ erro: 'Erro ao deletar item.' });
      }

      // Reordenar itens restantes
      const { data: restantes } = await supabaseAdmin
        .from('cerimonialista_roteiro_itens')
        .select('id')
        .eq('evento_id', itemExistente.evento_id)
        .eq('cerimonialista_id', cerimonialistaId)
        .order('ordem', { ascending: true });

      if (restantes && restantes.length > 0) {
        for (let i = 0; i < restantes.length; i++) {
          await supabaseAdmin
            .from('cerimonialista_roteiro_itens')
            .update({ ordem: i + 1 })
            .eq('id', restantes[i].id);
        }
      }

      return res.status(200).json({ sucesso: true });
    }

    // ─── POST /gerar ────────────────────────────────────────────────────
    if (req.method === 'POST' && req.query.acao === 'gerar') {
      const { evento_id } = req.body;

      if (!evento_id) {
        return res.status(400).json({ erro: 'evento_id obrigatório.' });
      }

      const { data: evento, error: evtError } = await supabaseAdmin
        .from('eventos')
        .select('id, cerimonialista_id, data_evento, tipo_cerimonia, tipo_local, horario_cerimonia, horario_recepcao, total_convidados, tipo_jantar, musica_festa')
        .eq('id', evento_id)
        .single();

      if (evtError || !evento || evento.cerimonialista_id !== cerimonialistaId) {
        return res.status(403).json({ erro: 'Evento não autorizado.' });
      }

      // Verificar se já existe roteiro para este evento
      const { data: existentes } = await supabaseAdmin
        .from('cerimonialista_roteiro_itens')
        .select('id')
        .eq('evento_id', evento_id)
        .eq('cerimonialista_id', cerimonialistaId);

      if (existentes && existentes.length > 0) {
        return res.status(409).json({ erro: 'Roteiro já existe para este evento. Exclua primeiro para gerar novamente.' });
      }

      // Gerar roteiro baseado no tipo de evento
      const roteiroPadrao = gerarRoteiroPadrao(evento);

      const itensParaInserir = roteiroPadrao.map((item, idx) => ({
        evento_id,
        cerimonialista_id: cerimonialistaId,
        horario: item.horario,
        titulo: item.titulo,
        descricao: item.descricao || null,
        responsavel: item.responsavel || null,
        status: 'pendente',
        ordem: idx + 1,
      }));

      const { data, error } = await supabaseAdmin
        .from('cerimonialista_roteiro_itens')
        .insert(itensParaInserir)
        .select();

      if (error) {
        console.error('Erro ao gerar roteiro:', error);
        return res.status(500).json({ erro: 'Erro ao gerar roteiro.' });
      }

      return res.status(201).json({
        sucesso: true,
        itens_criados: data.length,
        itens: data,
      });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (err) {
    console.error('Erro inesperado na API de roteiro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

function gerarRoteiroPadrao(evento) {
  const data = evento.data_evento ? new Date(evento.data_evento) : new Date();
  const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long' });
  const tipoCerimonia = evento.tipo_cerimonia || 'religiosa';
  const tipoLocal = evento.tipo_local || 'salao';
  const totalConvidados = parseInt(evento.total_convidados) || 100;
  const temJantar = evento.tipo_jantar && evento.tipo_jantar !== 'coquetel';
  const temMusica = !!evento.musica_festa;

  const roteiro = [];

  // Making of (sempre presente)
  roteiro.push({
    horario: '08:00',
    titulo: 'Início do making of — noiva',
    descricao: 'Preparação no local definido. Fotógrafo e cinegrafista devem estar presentes.',
    responsavel: 'Fotografia / Beleza',
  });

  roteiro.push({
    horario: '09:30',
    titulo: 'Início do making of — noivo',
    descricao: 'Preparação do noivo e padrinhos.',
    responsavel: 'Fotografia',
  });

  // Cerimônia
  if (tipoCerimonia === 'religiosa' || tipoCerimonia === 'catolica') {
    roteiro.push({
      horario: '16:00',
      titulo: 'Chegada dos noivos à igreja/templo',
      descricao: 'Entrada dos padrinhos, damas e pajens. Verificar flores e música.',
      responsavel: 'Cerimonialista / Celebrante',
    });
    roteiro.push({
      horario: '16:30',
      titulo: 'Início da cerimônia religiosa',
      descricao: 'Cerimônia com duração estimada de 45-60 minutos.',
      responsavel: 'Celebrante / Cerimonialista',
    });
  } else if (tipoCerimonia === 'civil') {
    roteiro.push({
      horario: '16:00',
      titulo: 'Chegada ao cartório/local civil',
      descricao: 'Verificar documentação e testemunhas.',
      responsavel: 'Cerimonialista',
    });
    roteiro.push({
      horario: '16:30',
      titulo: 'Cerimônia civil',
      descricao: 'Duração estimada de 20-30 minutos.',
      responsavel: 'Oficial / Cerimonialista',
    });
  } else if (tipoCerimonia === 'simbolica') {
    roteiro.push({
      horario: '16:30',
      titulo: 'Cerimônia simbólica',
      descricao: 'Cerimônia personalizada. Verificar rituais e decoração.',
      responsavel: 'Celebrante / Cerimonialista',
    });
  } else {
    roteiro.push({
      horario: '16:30',
      titulo: 'Cerimônia',
      descricao: 'Início da cerimônia conforme planejado.',
      responsavel: 'Cerimonialista',
    });
  }

  // Saída
  roteiro.push({
    horario: '17:30',
    titulo: 'Saída dos noivos',
    descricao: 'Confete, fotos na saída. Verificar carro dos noivos.',
    responsavel: 'Cerimonialista / Fotografia',
  });

  // Recepção / Coquetel
  if (tipoLocal === 'salao' || tipoLocal === 'sitio' || tipoLocal === 'praia') {
    roteiro.push({
      horario: '18:00',
      titulo: 'Chegada dos convidados à recepção',
      descricao: 'Coquetel de boas-vindas. Música ambiente.',
      responsavel: 'Buffet / Música',
    });
  }

  // Jantar ou coquetel estendido
  if (temJantar) {
    roteiro.push({
      horario: '19:30',
      titulo: 'Início do jantar',
      descricao: `Serviço para ${totalConvidados} convidados. Verificar mesas e cardápio.`,
      responsavel: 'Buffet / Cerimonialista',
    });
  } else {
    roteiro.push({
      horario: '19:00',
      titulo: 'Coquetel estendido',
      descricao: `Serviço contínuo para ${totalConvidados} convidados.`,
      responsavel: 'Buffet / Cerimonialista',
    });
  }

  // Entrada dos noivos na festa
  roteiro.push({
    horario: temJantar ? '20:30' : '20:00',
    titulo: 'Entrada dos noivos na festa',
    descricao: 'Música de entrada, primeiro dança. Verificar DJ/banda.',
    responsavel: 'Música / Cerimonialista',
  });

  // Discursos
  roteiro.push({
    horario: temJantar ? '21:00' : '20:30',
    titulo: 'Discursos e brindes',
    descricao: 'Padrinhos, pais e amigos. Controlar tempo (máx. 30 min).',
    responsavel: 'Cerimonialista',
  });

  // Bolo
  roteiro.push({
    horario: temJantar ? '22:00' : '21:30',
    titulo: 'Corte do bolo',
    descricao: 'Verificar faca, champanhe e fotógrafo posicionado.',
    responsavel: 'Cerimonialista / Fotografia',
  });

  // Dança
  if (temMusica) {
    roteiro.push({
      horario: temJantar ? '22:30' : '22:00',
      titulo: 'Abertura da pista de dança',
      descricao: 'Música animada. Verificar playlist com DJ/banda.',
      responsavel: 'Música',
    });
  }

  // Final
  roteiro.push({
    horario: '23:30',
    titulo: 'Saída dos noivos',
    descricao: 'Despedida, fogos/sparklers se previsto. Verificar carro e malas.',
    responsavel: 'Cerimonialista / Segurança',
  });

  roteiro.push({
    horario: '00:00',
    titulo: 'Encerramento da festa',
    descricao: 'Desmontagem e checkout com fornecedores.',
    responsavel: 'Cerimonialista / Equipe',
  });

  return roteiro;
}
