import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ erro: 'Método não permitido' })
    }

    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token não fornecido' })
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ erro: 'Não autenticado' })
    }

    const { evento_id } = req.query
    if (!evento_id) {
      return res.status(400).json({ erro: 'evento_id é obrigatório' })
    }

    // Verificar se usuário tem acesso ao evento
    const { data: evento, error: eventoError } = await supabaseAdmin
      .from('eventos')
      .select('usuario_id, cerimonialista_id')
      .eq('id', evento_id)
      .single()

    if (eventoError || !evento) {
      return res.status(404).json({ erro: 'Evento não encontrado' })
    }

    const isCasal = evento.usuario_id === user.id
    const isCerimonialista = evento.cerimonialista_id && await (async () => {
      const { data } = await supabaseAdmin
        .from('cerimonialistas')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('id', evento.cerimonialista_id)
        .single()
      return !!data
    })()

    if (!isCasal && !isCerimonialista) {
      return res.status(403).json({ erro: 'Acesso negado ao evento' })
    }

    const { data: mensagens, error } = await supabaseAdmin
      .from('mensagens')
      .select('*')
      .eq('evento_id', evento_id)
      .order('criado_em', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[mensagens/listar] erro:', error)
      return res.status(500).json({ erro: 'Erro ao buscar mensagens' })
    }

    // Inverter para ordem cronológica (mais antiga primeiro) para exibição
    return res.status(200).json({ mensagens: (mensagens || []).reverse() })
  } catch (error) {
    console.error('Erro em mensagens/listar:', error.message)
    return res.status(500).json({
      error: 'Erro interno do servidor. Tente novamente.',
    })
  }
}
