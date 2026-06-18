import { createServerSupabaseClient } from '../lib/supabase'
import { temAcessoPainel } from './acesso'

export async function getPainelServerSideProps(context) {
  const supabase = createServerSupabaseClient(context)

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { props: { readOnly: true, evento: null } }
  }

  const { data: evento, error: eventoError } = await supabase
    .from('eventos')
    .select('id, acesso_expira_em, acesso_iniciado_em, plano, nome_pessoa1, nome_pessoa2, nome_evento, data_evento, orcamento_total')
    .eq('usuario_id', user.id)
    .order('criado_em', { ascending: false })
    .limit(1)
    .single()

  if (eventoError || !evento) {
    return { props: { readOnly: true, evento: null } }
  }

  const temAcesso = temAcessoPainel(evento)
  return { props: { readOnly: !temAcesso, evento } }
}