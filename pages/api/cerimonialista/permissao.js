import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token obrigatório' })
  }
  const token = authHeader.replace('Bearer ', '')

  try {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    if (req.method === 'GET') {
      const { evento_id } = req.query
      if (!evento_id) {
        return res.status(400).json({ error: 'evento_id obrigatório' })
      }

      // Verifica se o usuário é o casal dono do evento
      const { data: eventoData, error: eventoError } = await supabaseAdmin
        .from('eventos')
        .select('cerimonialista_id')
        .eq('id', evento_id)
        .eq('usuario_id', user.id)
        .single()

      if (eventoError || !eventoData) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      if (!eventoData.cerimonialista_id) {
        return res.status(404).json({ error: 'Evento sem cerimonialista vinculado' })
      }

      const { data } = await supabaseAdmin
        .from('cerimonialista_permissoes')
        .select('*')
        .eq('evento_id', evento_id)
        .eq('cerimonialista_id', eventoData.cerimonialista_id)
        .single()

      return res.status(200).json({
        permissoes: data || {
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
        },
        cerimonialista_id: eventoData.cerimonialista_id,
      })
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const payload = req.body
      const { evento_id, cerimonialista_id, ...permissoes } = payload

      if (!evento_id || !cerimonialista_id) {
        return res.status(400).json({ error: 'evento_id e cerimonialista_id obrigatórios' })
      }

      // Verifica se o usuário é o casal dono do evento
      const { data: eventoData, error: eventoError } = await supabaseAdmin
        .from('eventos')
        .select('id')
        .eq('id', evento_id)
        .eq('usuario_id', user.id)
        .single()

      if (eventoError || !eventoData) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      // Memorial sempre true
      permissoes.ver_memorial = true

      const { data, error } = await supabaseAdmin
        .from('cerimonialista_permissoes')
        .upsert({
          evento_id,
          cerimonialista_id,
          ...permissoes,
          atualizado_em: new Date().toISOString(),
        }, {
          onConflict: 'evento_id,cerimonialista_id',
        })
        .select()
        .single()

      if (error) {
        console.error('[permissao] erro upsert:', error)
        return res.status(500).json({ error: 'Erro ao salvar permissões' })
      }

      return res.status(200).json({ permissoes: data })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[permissao] erro:', err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
