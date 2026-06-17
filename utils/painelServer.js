// utils/painelServer.js — Helper getServerSideProps para paginas do painel
import { createClient } from '@supabase/supabase-js';
import { temAcessoPainel } from './acesso';

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    if (name) cookies[name.trim()] = rest.join('=').trim();
  });
  return cookies;
}

export async function getPainelServerSideProps(context) {
  const { req } = context;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const cookies = parseCookies(req.headers.cookie);
  const authCookieKey = Object.keys(cookies).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  let userId = null;

  if (authCookieKey) {
    try {
      const session = JSON.parse(decodeURIComponent(cookies[authCookieKey]));
      const { data } = await supabaseAdmin.auth.getUser(session.access_token);
      userId = data?.user?.id || null;
    } catch (e) {
      console.error('Erro ao validar sessao:', e);
    }
  }

  if (!userId) {
    return {
      redirect: { destination: '/login', permanent: false },
    };
  }

  const { data: evento, error } = await supabaseAdmin
    .from('eventos')
    .select('*')
    .eq('usuario_id', userId)
    .order('criado_em', { ascending: false })
    .limit(1)
    .single();

  if (error || !evento) {
    return {
      redirect: { destination: '/memorial', permanent: false },
    };
  }

  const temAcesso = temAcessoPainel(evento);
  const jaIniciou = !!evento.acesso_iniciado_em;

  if (!temAcesso && !jaIniciou) {
    return {
      redirect: { destination: '/memorial/conclusao', permanent: false },
    };
  }

  return {
    props: {
      readOnly: !temAcesso,
      eventoServer: evento,
    },
  };
}
