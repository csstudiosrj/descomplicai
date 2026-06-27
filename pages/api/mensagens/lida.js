import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST' && req.method !== 'PATCH') {
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

    const { evento_id } = req.body
    if (!evento_id) {
      return res.status(400).json({ erro: 'evento_id é obrigatório' })
    }

    // Verificar acesso ao evento
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

    // Marcar como lidas as mensagens onde o remetente NÃO é o usuário atual
    const { error } = await supabaseAdmin
      .from('mensagens')
      .update({ lida: true })
      .eq('evento_id', evento_id)
      .neq('remetente_id', user.id)
      .eq('lida', false)

    if (error) {
      console.error('[mensagens/lida] erro:', error)
      return res.status(500).json({ erro: 'Erro ao marcar mensagens como lidas' })
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Erro em mensagens/lida:', error.message)
    return res.status(500).json({
      error: 'Erro interno do servidor. Tente novamente.',
    })
  }
}
