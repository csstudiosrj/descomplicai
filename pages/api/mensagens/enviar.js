import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { supabase } from '../../../lib/supabase'
import { enviarEmailNotificacaoChat } from '../../../lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

  const { evento_id, conteudo } = req.body
  if (!evento_id || !conteudo?.trim()) {
    return res.status(400).json({ erro: 'evento_id e conteudo são obrigatórios' })
  }

  // Verificar acesso ao evento e determinar tipo de remetente
  const { data: evento, error: eventoError } = await supabaseAdmin
    .from('eventos')
    .select('usuario_id, cerimonialista_id, nome_evento')
    .eq('id', evento_id)
    .single()

  if (eventoError || !evento) {
    return res.status(404).json({ erro: 'Evento não encontrado' })
  }

  let remetente_tipo = null
  let destinatario_id = null
  let destinatario_tipo = null
  let destinatario_info = null

  if (evento.usuario_id === user.id) {
    remetente_tipo = 'casal'
    destinatario_tipo = 'cerimonialista'
    if (evento.cerimonialista_id) {
      const { data: cerim } = await supabaseAdmin
        .from('cerimonialistas')
        .select('usuario_id, nome_empresa, email')
        .eq('id', evento.cerimonialista_id)
        .single()
      if (cerim) {
        destinatario_id = cerim.usuario_id
        destinatario_info = cerim
      }
    }
  } else {
    // Verificar se é cerimonialista deste evento
    const { data: cerim } = await supabaseAdmin
      .from('cerimonialistas')
      .select('id, usuario_id, nome_empresa, email')
      .eq('usuario_id', user.id)
      .eq('id', evento.cerimonialista_id)
      .single()

    if (cerim) {
      remetente_tipo = 'cerimonialista'
      destinatario_tipo = 'casal'
      destinatario_id = evento.usuario_id
      destinatario_info = null
    } else {
      return res.status(403).json({ erro: 'Acesso negado ao evento' })
    }
  }

  // Inserir mensagem
  const { data: mensagem, error: insertError } = await supabaseAdmin
    .from('mensagens')
    .insert({
      evento_id,
      remetente_id: user.id,
      remetente_tipo,
      conteudo: conteudo.trim(),
      lida: false,
    })
    .select()
    .single()

  if (insertError) {
    console.error('[mensagens/enviar] erro ao inserir:', insertError)
    return res.status(500).json({ erro: 'Erro ao enviar mensagem' })
  }

  // Verificar se destinatário está "online" (enviou mensagem nos últimos 2 minutos)
  let destinatarioOnline = false
  if (destinatario_id) {
    const doisMinutosAtras = new Date(Date.now() - 2 * 60 * 1000).toISOString()
    const { data: ultimaMsg } = await supabaseAdmin
      .from('mensagens')
      .select('criado_em')
      .eq('evento_id', evento_id)
      .eq('remetente_id', destinatario_id)
      .gte('criado_em', doisMinutosAtras)
      .order('criado_em', { ascending: false })
      .limit(1)
      .single()

    destinatarioOnline = !!ultimaMsg
  }

  // Se offline, disparar email de notificação
  if (!destinatarioOnline && destinatario_id) {
    let destinatarioEmail = null
    let destinatarioNome = null

    if (destinatario_tipo === 'cerimonialista') {
      const { data: cerim } = await supabaseAdmin
        .from('cerimonialistas')
        .select('email, nome_empresa')
        .eq('id', evento.cerimonialista_id)
        .single()
      if (cerim) {
        destinatarioEmail = cerim.email
        destinatarioNome = cerim.nome_empresa
      }
    } else {
      // Buscar email do auth.users
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(destinatario_id)
      if (userData?.user?.email) {
        destinatarioEmail = userData.user.email
        destinatarioNome = evento.nome_evento || 'Casal'
      }
    }

    if (destinatarioEmail) {
      const remetenteNome = remetente_tipo === 'casal'
        ? (evento.nome_evento || 'Casal')
        : (destinatario_info?.nome_empresa || 'Cerimonialista')

      await enviarEmailNotificacaoChat({
        to: destinatarioEmail,
        remetenteNome,
        eventoNome: evento.nome_evento || 'Evento',
        preview: conteudo.trim().slice(0, 120),
      })
    }
  }

  return res.status(201).json({ mensagem })
}
