import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { eventoId } = req.query
  if (!eventoId) {
    return res.status(400).json({ error: 'eventoId obrigatório' })
  }

  // Extrai token do header Authorization
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token obrigatório' })
  }
  const token = authHeader.replace('Bearer ', '')

  try {
    // Verifica token e obtém usuário
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    // Verifica se o usuário é cerimonialista vinculado ao evento
    const { data: cerimData, error: cerimError } = await supabaseAdmin
      .from('cerimonialistas')
      .select('id')
      .eq('usuario_id', user.id)
      .single()

    if (cerimError || !cerimData) {
      return res.status(403).json({ error: 'Acesso negado: não é cerimonialista' })
    }

    const cerimonialistaId = cerimData.id

    // Verifica vinculação ao evento
    const { data: eventoData, error: eventoError } = await supabaseAdmin
      .from('eventos')
      .select('id, nome_evento, data_evento, orcamento, cerimonialista_id, usuario_id, casal_confirmado, memorial_concluido')
      .eq('id', eventoId)
      .eq('cerimonialista_id', cerimonialistaId)
      .single()

    if (eventoError || !eventoData) {
      return res.status(403).json({ error: 'Acesso negado: evento não vinculado' })
    }

    // Busca permissões do casal
    const { data: permissoes } = await supabaseAdmin
      .from('cerimonialista_permissoes')
      .select('*')
      .eq('evento_id', eventoId)
      .eq('cerimonialista_id', cerimonialistaId)
      .single()

    const perm = permissoes || {
      ver_fornecedores: false,
      editar_fornecedores: false,
      ver_financeiro: false,
      editar_financeiro: false,
      ver_tarefas: false,
      editar_tarefas: false,
      ver_convidados: false,
      editar_convidados: false,
      ver_chat: false,
      editar_chat: false,
      ver_cronograma: false,
      editar_cronograma: false,
      ver_contratos: false,
      editar_contratos: false,
      ver_mesas: false,
      editar_mesas: false,
      ver_memorial: true,
    }

    // Busca dados do casal conforme permissões
    const resultado = {
      evento: eventoData,
      permissoes: perm,
      fornecedores: null,
      financeiro: null,
      tarefas: null,
      convidados: null,
      mensagens: null,
      memorial: null,
      mesas: null,
    }

    if (perm.ver_fornecedores) {
      const { data } = await supabaseAdmin
        .from('fornecedores')
        .select('id, nome, categoria, status, valor_total, pre_criado')
        .eq('evento_id', eventoId)
      resultado.fornecedores = data || []
    }

    if (perm.ver_financeiro) {
      const { data } = await supabaseAdmin
        .from('financeiro')
        .select('id, descricao, valor_estimado, valor_real, pago, data_vencimento')
        .eq('evento_id', eventoId)
        .eq('fornecedor_excluido', false)
      resultado.financeiro = data || []
    }

    if (perm.ver_tarefas) {
      const { data } = await supabaseAdmin
        .from('tarefas')
        .select('*')
        .eq('evento_id', eventoId)
        .order('prazo', { ascending: true })
      resultado.tarefas = data || []
    }

    if (perm.ver_convidados) {
      const { data } = await supabaseAdmin
        .from('convidados')
        .select('id, nome, confirmado, mesa')
        .eq('evento_id', eventoId)
      resultado.convidados = data || []
    }

    if (perm.ver_chat) {
      const { count } = await supabaseAdmin
        .from('mensagens')
        .select('*', { count: 'exact', head: true })
        .eq('evento_id', eventoId)
        .eq('lida', false)
        .neq('remetente_id', user.id)
      resultado.mensagens = { naoLidas: count || 0 }
    }

    if (perm.ver_memorial) {
      const { data } = await supabaseAdmin
        .from('memoriais')
        .select('id, estado, criado_em')
        .eq('evento_id', eventoId)
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle()
      resultado.memorial = data
    }

    if (perm.ver_mesas) {
      const { data: mesasData } = await supabaseAdmin
        .from('mesas')
        .select('id, numero, tipo, capacidade, convidados')
        .eq('evento_id', eventoId)
      resultado.mesas = mesasData || []
    }

    return res.status(200).json(resultado)
  } catch (err) {
    console.error('[espelho] erro:', err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
