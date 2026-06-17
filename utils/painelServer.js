import { createClient } from '@supabase/supabase-js';
import { temAcessoPainel } from './acesso';

export async function getPainelServerSideProps(context) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false }
    }
  );

  const { req } = context;
  const token = req.cookies['sb-access-token'];

  if (!token) {
    return { props: { readOnly: true } };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { props: { readOnly: true } };
    }

    const { data: evento } = await supabase
      .from('eventos')
      .select('acesso_expira_em, acesso_iniciado_em, plano, nome_pessoa1, nome_pessoa2, nome_evento, data_evento, orcamento_total')
      .eq('usuario_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(1)
      .single();

    const temAcesso = temAcessoPainel(evento);
    return { props: { readOnly: !temAcesso, evento: evento || null } };
  } catch (err) {
    return { props: { readOnly: true } };
  }
}