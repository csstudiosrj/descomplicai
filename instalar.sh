#!/bin/bash
# Script de instalacao completo — Descomplicai Painel
set -e

echo "========================================"
echo "  Descomplicai — Instalador de arquivos"
echo "========================================"

# Cria diretorios
mkdir -p utils hooks components/painel pages/api/pagamento pages/api/evento pages/memorial pages/painel

echo "[1/14] Criando utils/acesso.js..."
cat > utils/acesso.js << 'EOF'
// utils/acesso.js — Controle de acesso ao painel
export function temAcessoPainel(evento) {
  if (!evento || !evento.acesso_expira_em) return false;
  const agora = new Date();
  const expira = new Date(evento.acesso_expira_em);
  return expira >= agora;
}

export function calcularNovaExpiracao(expiraAtual, duracaoMeses) {
  const agora = new Date();
  const base = expiraAtual && new Date(expiraAtual) > agora ? new Date(expiraAtual) : agora;
  const novo = new Date(base);

  if (duracaoMeses < 1) {
    novo.setDate(novo.getDate() + Math.round(duracaoMeses * 30));
  } else {
    novo.setMonth(novo.getMonth() + Math.floor(duracaoMeses));
    if (novo.getDate() < base.getDate()) {
      novo.setDate(0);
    }
  }

  return novo.toISOString();
}

export function iniciarTrial(evento) {
  const agora = new Date();
  const expira = new Date(agora);
  expira.setDate(expira.getDate() + 7);
  return {
    acesso_iniciado_em: agora.toISOString(),
    acesso_expira_em: expira.toISOString(),
    plano: 'trial',
  };
}
EOF

echo "[2/14] Criando utils/painelServer.js..."
cat > utils/painelServer.js << 'EOF'
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
EOF

echo "[3/14] Criando hooks/useAuth.js..."
cat > hooks/useAuth.js << 'EOF'
// hooks/useAuth.js — Autenticacao com Supabase
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { temAcessoPainel } from '../utils/acesso';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await buscarEvento(session.user.id);
      }
      setLoading(false);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        buscarEvento(session.user.id);
      } else {
        setEvento(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const buscarEvento = useCallback(async (userId) => {
    const { data } = await supabase
      .from('eventos')
      .select('*')
      .eq('usuario_id', userId)
      .order('criado_em', { ascending: false })
      .limit(1)
      .single();
    setEvento(data);
  }, []);

  const login = useCallback(async (email, senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (data?.user) await buscarEvento(data.user.id);
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEvento(null);
  }, []);

  const hasAccess = temAcessoPainel(evento);

  return { user, evento, loading, carregando: loading, hasAccess, login, signOut, supabase };
}

export { supabase };
EOF

echo "[4/14] Criando components/painel/ProtectedRoute.jsx..."
cat > components/painel/ProtectedRoute.jsx << 'EOF'
// components/painel/ProtectedRoute.jsx — Protecao de rota do painel
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.loading}>
        <p style={styles.loadingText}>Redirecionando...</p>
      </div>
    );
  }

  return children;
}

const styles = {
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid var(--color-secondary)',
    borderTopColor: 'var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '14px',
    color: 'var(--color-text-soft)',
  },
};
EOF

echo "[5/14] Criando pages/api/pagamento/criar.js..."
cat > pages/api/pagamento/criar.js << 'EOF'
// pages/api/pagamento/criar.js
import { client, Preference } from '../../../lib/mercadopago';

const PLANOS = {
  mensal: { duracao_meses: 1, preco: 29.9, titulo: 'Descomplicai — Plano Mensal' },
  '3_meses': { duracao_meses: 3, preco: 79.9, titulo: 'Descomplicai — Plano 3 Meses' },
  '6_meses': { duracao_meses: 6, preco: 149.9, titulo: 'Descomplicai — Plano 6 Meses' },
  '12_meses': { duracao_meses: 12, preco: 249.9, titulo: 'Descomplicai — Plano 12 Meses' },
  '18_meses': { duracao_meses: 18, preco: 349.9, titulo: 'Descomplicai — Plano 18 Meses' },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Metodo nao permitido' });
  }

  const { tipo, usuarioId, eventoId, plano } = req.body;

  if (!tipo) {
    return res.status(400).json({ erro: 'Tipo de pagamento nao informado' });
  }

  if (!usuarioId || !eventoId) {
    return res.status(400).json({ erro: 'usuarioId e eventoId sao obrigatorios' });
  }

  let item;
  let duracaoMeses = 0;
  let metadata = {};

  if (tipo === 'memorial_pdf') {
    item = {
      title: 'Memorial do Casamento — PDF Completo',
      quantity: 1,
      unit_price: 197,
      currency_id: 'BRL',
    };
    metadata = { duracao_meses: 0 };
  } else if (tipo === 'assinatura') {
    const planoConfig = PLANOS[plano || 'mensal'];
    if (!planoConfig) {
      return res.status(400).json({ erro: 'Plano de assinatura invalido' });
    }
    item = {
      title: planoConfig.titulo,
      quantity: 1,
      unit_price: planoConfig.preco,
      currency_id: 'BRL',
    };
    duracaoMeses = planoConfig.duracao_meses;
    metadata = { duracao_meses: duracaoMeses };
  } else {
    return res.status(400).json({ erro: 'Tipo de pagamento invalido' });
  }

  try {
    const preference = new Preference(client);
    const resultado = await preference.create({
      body: {
        items: [item],
        metadata,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/memorial/conclusao?pagamento=sucesso&tipo=${tipo}&concluido=1`,
          failure: `${process.env.NEXT_PUBLIC_URL}/memorial/conclusao?pagamento=erro&concluido=1`,
          pending: `${process.env.NEXT_PUBLIC_URL}/memorial/conclusao?pagamento=pendente&concluido=1`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/pagamento/webhook`,
        external_reference: JSON.stringify({ usuarioId, eventoId, tipo, duracao_meses: duracaoMeses }),
      },
    });

    res.status(200).json({
      sucesso: true,
      checkoutUrl: resultado.init_point,
      preferenceId: resultado.id,
    });
  } catch (erro) {
    console.error('Erro Mercado Pago:', erro);
    res.status(500).json({ erro: 'Erro ao criar pagamento', detalhe: erro.message });
  }
}
EOF

echo "[6/14] Criando pages/api/pagamento/webhook.js..."
cat > pages/api/pagamento/webhook.js << 'EOF'
// pages/api/pagamento/webhook.js
import { client, Payment } from '../../../lib/mercadopago';
import { createClient } from '@supabase/supabase-js';
import { calcularNovaExpiracao } from '../../../utils/acesso';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { type, data } = req.body;
  if (type !== 'payment') return res.status(200).end();

  try {
    const paymentClient = new Payment(client);
    const pagamento = await paymentClient.get({ id: data.id });

    if (pagamento.status !== 'approved') return res.status(200).end();

    const ref = JSON.parse(pagamento.external_reference || '{}');
    const { usuarioId, eventoId, tipo } = ref;
    let duracaoMeses = pagamento.metadata?.duracao_meses ?? ref.duracao_meses ?? 0;

    if (!usuarioId || !eventoId || !tipo) {
      console.error('Webhook: external_reference invalido', pagamento.external_reference);
      return res.status(400).end();
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: eventoAtual } = await supabaseAdmin
      .from('eventos')
      .select('acesso_expira_em, acesso_iniciado_em')
      .eq('id', eventoId)
      .single();

    let novaExpiracao;
    let novoPlano;

    if (tipo === 'assinatura') {
      novaExpiracao = calcularNovaExpiracao(eventoAtual?.acesso_expira_em, duracaoMeses);
      novoPlano = duracaoMeses === 1 ? 'mensal' : `${duracaoMeses}_meses`;
    } else if (tipo === 'memorial_pdf') {
      novaExpiracao = calcularNovaExpiracao(eventoAtual?.acesso_expira_em, 0.5);
      novoPlano = 'pdf';
    } else {
      return res.status(400).end();
    }

    await supabaseAdmin
      .from('eventos')
      .update({
        acesso_expira_em: novaExpiracao,
        acesso_iniciado_em: eventoAtual?.acesso_iniciado_em || new Date().toISOString(),
        plano: novoPlano,
      })
      .eq('id', eventoId);

    await supabaseAdmin.from('pagamentos').insert({
      usuario_id: usuarioId,
      evento_id: eventoId,
      tipo,
      valor: pagamento.transaction_amount,
      status: 'aprovado',
      mp_payment_id: String(pagamento.id),
      duracao_meses: duracaoMeses || null,
      aceite_termo_em: null,
    });

    res.status(200).end();
  } catch (erro) {
    console.error('Webhook erro:', erro);
    res.status(500).end();
  }
}
EOF

echo "[7/14] Criando pages/api/evento/trial.js..."
cat > pages/api/evento/trial.js << 'EOF'
// pages/api/evento/trial.js — Inicia trial de 7 dias no painel
import { createClient } from '@supabase/supabase-js';
import { iniciarTrial } from '../../../utils/acesso';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Metodo nao permitido' });
  }

  const { eventoId } = req.body;
  if (!eventoId) {
    return res.status(400).json({ erro: 'eventoId obrigatorio' });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data: evento, error: fetchError } = await supabaseAdmin
      .from('eventos')
      .select('acesso_iniciado_em, usuario_id')
      .eq('id', eventoId)
      .single();

    if (fetchError || !evento) {
      return res.status(404).json({ erro: 'Evento nao encontrado' });
    }

    if (evento.acesso_iniciado_em) {
      return res.status(400).json({ erro: 'Trial ja iniciado' });
    }

    const trial = iniciarTrial(evento);

    const { error: updateError } = await supabaseAdmin
      .from('eventos')
      .update(trial)
      .eq('id', eventoId);

    if (updateError) {
      throw updateError;
    }

    res.status(200).json({ sucesso: true, trial });
  } catch (erro) {
    console.error('Erro ao iniciar trial:', erro);
    res.status(500).json({ erro: 'Erro ao iniciar trial' });
  }
}
EOF

echo "[8/14] Criando pages/memorial/conclusao.jsx..."
cat > pages/memorial/conclusao.jsx << 'EOF'
// pages/memorial/conclusao.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { montarPayloadParaAPI } from '../../utils/gerador-memorial';
import { useAuth } from '../../hooks/useAuth';
import { useMemorial } from '../../hooks/useMemorial';
import useAutoSave from '../../hooks/useAutoSave';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import Icon from '../../components/ui/Icon';
import { temAcessoPainel } from '../../utils/acesso';

const PLANOS_ASSINATURA = [
  { id: 'mensal', label: 'Mensal', preco: 'R$29,90/mes', duracao: 1 },
  { id: '3_meses', label: '3 Meses', preco: 'R$79,90', duracao: 3 },
  { id: '6_meses', label: '6 Meses', preco: 'R$149,90', duracao: 6 },
  { id: '12_meses', label: '12 Meses', preco: 'R$249,90', duracao: 12 },
  { id: '18_meses', label: '18 Meses', preco: 'R$349,90', duracao: 18 },
];

export default function ConclusaoPage() {
  const router = useRouter();
  const { estado, carregarEstado } = useMemorial();
  const { user, evento } = useAuth();
  const { isHydrated, carregarDraft } = useAutoSave(estado);
  const [status, setStatus] = useState('carregando');
  const [memorial, setMemorial] = useState('');
  const [erro, setErro] = useState('');
  const [baixandoPDF, setBaixandoPDF] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [modalPlanos, setModalPlanos] = useState(false);
  const [aceiteTermosTrial, setAceiteTermosTrial] = useState(false);
  const [aceiteTermosPDF, setAceiteTermosPDF] = useState(false);
  const [aceiteTermosAssinatura, setAceiteTermosAssinatura] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState('mensal');
  const [iniciandoTrial, setIniciandoTrial] = useState(false);

  const { pagamento, tipo: tipoProduto, concluido, collection_status } = router.query;
  const pagamentoAprovado = pagamento === 'sucesso' || collection_status === 'approved';

  const pdfJaComprado = evento?.plano === 'pdf';
  const temAcesso = temAcessoPainel(evento);
  const trialJaIniciado = !!evento?.acesso_iniciado_em;

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (isMounted && isHydrated && temAcesso) {
      router.replace('/painel');
    }
  }, [isMounted, isHydrated, temAcesso, router]);

  useEffect(() => {
    if (!isMounted || !isHydrated) return;
    const draft = carregarDraft();
    if (draft) {
      carregarEstado(draft);
    } else if (!concluido) {
      router.replace('/memorial');
      return;
    } else {
      setStatus('erro');
      setErro('Dados do memorial nao encontrados. Por favor, finalize novamente.');
      return;
    }
  }, [isMounted, isHydrated]);

  useEffect(() => {
    if (!estado || !estado.etapaAtual || status !== 'carregando') return;
    const gerarMemorial = async () => {
      try {
        const payload = montarPayloadParaAPI(estado);
        const resposta = await fetch('/api/ia/gerar-memorial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await resposta.json();
        if (!resposta.ok || !data.sucesso) {
          throw new Error(data.erro || 'Erro desconhecido');
        }
        setMemorial(data.memorial);
        setStatus('pronto');
      } catch (err) {
        setErro(err.message);
        setStatus('erro');
      }
    };
    gerarMemorial();
  }, [estado, status]);

  const baixarPDF = async () => {
    setBaixandoPDF(true);
    try {
      const dadosEvento = montarPayloadParaAPI(estado);
      const resposta = await fetch('/api/gerar-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memorial, dadosEvento }),
      });
      if (!resposta.ok) {
        let mensagemErro = 'Erro ao gerar PDF';
        const texto = await resposta.text();
        try {
          const json = JSON.parse(texto);
          mensagemErro = json.erro || json.detalhe || mensagemErro;
        } catch {
          mensagemErro = `Erro ${resposta.status} no servidor. Tente novamente.`;
        }
        throw new Error(mensagemErro);
      }
      const blob = await resposta.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'memorial-descomplicai.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Nao foi possivel baixar o PDF. Tente novamente.');
    } finally {
      setBaixandoPDF(false);
    }
  };

  const handleIniciarTrial = async () => {
    if (!user?.id || !evento?.id) { alert('Faca login primeiro para continuar.'); return; }
    if (!aceiteTermosTrial) { alert('Aceite os termos para continuar.'); return; }
    setIniciandoTrial(true);
    try {
      const resposta = await fetch('/api/evento/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventoId: evento.id }),
      });
      const data = await resposta.json();
      if (data.sucesso) {
        router.push('/painel');
      } else {
        alert(data.erro || 'Erro ao iniciar trial');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao iniciar trial. Tente novamente.');
    } finally {
      setIniciandoTrial(false);
    }
  };

  const handleComprarPDF = async () => {
    if (!user?.id || !evento?.id) { alert('Faca login primeiro para continuar.'); return; }
    if (!aceiteTermosPDF) { alert('Aceite os termos para continuar.'); return; }
    setPagando(true);
    try {
      const dadosEvento = { ...montarPayloadParaAPI(estado), email: user?.email || null };
      const resposta = await fetch('/api/pagamento/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'memorial_pdf', usuarioId: user.id, eventoId: evento.id, dadosEvento }),
      });
      const data = await resposta.json();
      if (data.checkoutUrl) { window.location.href = data.checkoutUrl; }
      else { alert(data.erro || 'Erro ao iniciar pagamento'); }
    } catch (err) {
      console.error(err);
      alert('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setPagando(false);
    }
  };

  const handleComprarAssinatura = async () => {
    if (!user?.id || !evento?.id) { alert('Faca login primeiro para continuar.'); return; }
    if (!aceiteTermosAssinatura) { alert('Aceite os termos para continuar.'); return; }
    setPagando(true);
    try {
      const dadosEvento = { ...montarPayloadParaAPI(estado), email: user?.email || null };
      const resposta = await fetch('/api/pagamento/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'assinatura', plano: planoSelecionado, usuarioId: user.id, eventoId: evento.id, dadosEvento }),
      });
      const data = await resposta.json();
      if (data.checkoutUrl) { window.location.href = data.checkoutUrl; }
      else { alert(data.erro || 'Erro ao iniciar pagamento'); }
    } catch (err) {
      console.error(err);
      alert('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setPagando(false);
    }
  };

  if (!isMounted || !isHydrated || temAcesso) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando...</p>
      </div>
    );
  }

  if (status === 'carregando') {
    return (
      <>
        <Header />
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', backgroundColor: 'var(--color-off-white)' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto var(--space-6)' }} />
            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>Gerando seu memorial...</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>Estamos criando cada detalhe. Isso leva apenas alguns segundos.</p>
          </div>
        </div>
      </>
    );
  }

  if (status === 'erro') {
    return (
      <>
        <Header />
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', backgroundColor: 'var(--color-off-white)' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-danger)', marginBottom: 'var(--space-2)' }}>Ops!</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>{erro || 'Nao foi possivel gerar o memorial. Tente novamente.'}</p>
            <Button variant="primary" onClick={() => router.push('/memorial')}>Voltar ao memorial</Button>
          </div>
        </div>
      </>
    );
  }

  const pdfLiberado = pdfJaComprado || (pagamentoAprovado && tipoProduto === 'memorial_pdf');
  const conteudoMemorial = pdfLiberado ? memorial : memorial.substring(0, 800);
  const mostrarBlur = !pdfLiberado && memorial.length > 800;

  return (
    <>
      <Head><title>Seu memorial esta pronto — Descomplicai</title></Head>
      <Header />
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'var(--space-6) var(--space-4) var(--space-8)', fontFamily: 'var(--font-body)' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>Memorial pronto!</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)' }}>
            {pdfLiberado ? 'Seu pagamento foi aprovado! Baixe o PDF completo.' : 'Ele foi gerado com base nas suas escolhas. Confira um trecho:'}
          </p>
        </div>

        <div style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 'var(--space-6)', backgroundColor: 'var(--color-white)', marginBottom: 'var(--space-6)' }}>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 'var(--leading-relaxed)' }}>{conteudoMemorial}</div>
          {mostrarBlur && (
            <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-off-white) 100%)', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', border: '1px dashed var(--color-border)' }}>
              O conteudo completo do memorial esta disponivel apos a compra do PDF.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          {pdfLiberado ? (
            <>
              <Button variant="primary" size="lg" fullWidth loading={baixandoPDF} onClick={baixarPDF}>
                {baixandoPDF ? 'Gerando PDF...' : 'Baixar PDF completo'}
              </Button>
              <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Seu PDF esta liberado! Clique no botao acima para fazer o download.</p>
            </>
          ) : (
            <>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={aceiteTermosPDF} onChange={(e) => setAceiteTermosPDF(e.target.checked)} style={{ marginTop: '2px' }} />
                <span>Li e aceito os termos de uso para aquisicao do PDF.</span>
              </label>
              <Button variant="primary" size="lg" fullWidth loading={pagando} onClick={handleComprarPDF}>
                {pagando ? 'Redirecionando...' : 'Baixar PDF completo — R$197'}
              </Button>
            </>
          )}

          {!temAcesso && (
            <>
              {pdfLiberado && (
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)', textAlign: 'center' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                    Quer gerenciar seu casamento? Assine agora e ganhe <strong>15 dias gratis</strong> de painel.
                  </p>
                  <Button variant="secondary" size="md" fullWidth onClick={() => setModalPlanos(true)}>Assinar painel — 15 dias gratis</Button>
                </div>
              )}

              {!pdfLiberado && (
                <>
                  {!trialJaIniciado ? (
                    <>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={aceiteTermosTrial} onChange={(e) => setAceiteTermosTrial(e.target.checked)} style={{ marginTop: '2px' }} />
                        <span>Li e aceito os termos de uso para iniciar o trial gratuito de 7 dias.</span>
                      </label>
                      <Button variant="secondary" size="lg" fullWidth loading={iniciandoTrial} onClick={handleIniciarTrial}>
                        {iniciandoTrial ? 'Iniciando...' : 'Gerenciar meu casamento — 7 dias gratis'}
                      </Button>
                    </>
                  ) : (
                    <Button variant="secondary" size="lg" fullWidth onClick={() => setModalPlanos(true)}>
                      Assinar painel — escolha seu plano
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {pagamento === 'pendente' && (
          <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: '#FFF3E6', borderRadius: 'var(--radius-md)', color: 'var(--color-warning-dark)', fontFamily: 'var(--font-body)' }}>
            Pagamento em processamento. Assim que confirmado, voce recebera o acesso.
          </div>
        )}

        {!pdfLiberado && !temAcesso && (
          <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Seu memorial ficara salvo por 7 dias. Depois e so assinar para manter o acesso.
          </p>
        )}
      </div>

      {modalPlanos && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }} onClick={() => setModalPlanos(false)}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-primary)', marginBottom: '16px' }}>Escolha seu plano</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {PLANOS_ASSINATURA.map((plano) => (
                <label key={plano.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', border: '2px solid', borderColor: planoSelecionado === plano.id ? 'var(--color-primary)' : 'var(--color-secondary)', cursor: 'pointer' }}>
                  <input type="radio" name="plano" value={plano.id} checked={planoSelecionado === plano.id} onChange={() => setPlanoSelecionado(plano.id)} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{plano.label}</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-soft)' }}>{plano.preco}</div>
                  </div>
                </label>
              ))}
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', cursor: 'pointer', marginBottom: '16px' }}>
              <input type="checkbox" checked={aceiteTermosAssinatura} onChange={(e) => setAceiteTermosAssinatura(e.target.checked)} style={{ marginTop: '2px' }} />
              <span>Li e aceito os termos de uso da assinatura.</span>
            </label>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalPlanos(false)} style={styles.btnSecondary}>Cancelar</button>
              <button onClick={handleComprarAssinatura} style={styles.btnPrimary}>
                {pagando ? 'Redirecionando...' : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

const styles = {
  btnPrimary: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  btnSecondary: { background: 'var(--color-secondary)', color: 'var(--color-text)', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
};
EOF


echo "[9/14] Criando pages/painel/index.jsx..."
cat > pages/painel/index.jsx << 'EOF'
// pages/painel/index.jsx — Dashboard principal
import { useEffect, useState } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import ProgressBar from '../../components/painel/ProgressBar';
import AlertCards from '../../components/painel/AlertCards';
import NavCards from '../../components/painel/NavCards';
import { useAuth } from '../../hooks/useAuth';
import { getPainelServerSideProps } from '../../utils/painelServer';

export default function PainelPage({ readOnly, eventoServer }) {
  return (
    <ProtectedRoute>
      <PainelContent readOnly={readOnly} eventoServer={eventoServer} />
    </ProtectedRoute>
  );
}

function PainelContent({ readOnly, eventoServer }) {
  const { user, evento, signOut, supabase } = useAuth();
  const [progresso, setProgresso] = useState(0);
  const [pagamentos, setPagamentos] = useState([]);
  const [tarefas, setTarefas] = useState([]);

  const eventoAtivo = evento || eventoServer;

  useEffect(() => {
    if (!eventoAtivo) return;
    buscarDados();
  }, [eventoAtivo]);

  const buscarDados = async () => {
    const { data: tarefasData } = await supabase.from('tarefas').select('*').eq('evento_id', eventoAtivo.id);
    if (tarefasData) {
      const total = tarefasData.length;
      const concluidas = tarefasData.filter(t => t.concluida).length;
      setProgresso(total > 0 ? Math.round((concluidas / total) * 100) : 0);
      const hoje = new Date();
      const tarefasComStatus = tarefasData.map(t => ({
        ...t,
        atrasada: t.prazo && new Date(t.prazo) < hoje && !t.concluida,
      }));
      setTarefas(tarefasComStatus);
    }

    const { data: pagosData } = await supabase.from('pagamentos').select('*').eq('evento_id', eventoAtivo.id).eq('status', 'pendente');
    if (pagosData) {
      const hoje = new Date();
      const pagosComDias = pagosData.map(p => {
        const venc = new Date(p.data_vencimento);
        const dias = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
        return { ...p, dias };
      }).filter(p => p.dias <= 7 && p.dias >= 0);
      setPagamentos(pagosComDias);
    }
  };

  const nomeCasal = eventoAtivo
    ? (eventoAtivo.nome_pessoa1 && eventoAtivo.nome_pessoa2
        ? `${eventoAtivo.nome_pessoa1} & ${eventoAtivo.nome_pessoa2}`
        : eventoAtivo.nome_evento
          ? eventoAtivo.nome_evento.split("&").map(n => n.trim().charAt(0).toUpperCase() + n.trim().slice(1)).join(" & ")
          : "Seu Casamento")
    : 'Seu Casamento';

  return (
    <>
      <Head><title>Painel | descomplicai</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={eventoAtivo?.data_evento} onLogout={signOut} />
        <main style={styles.main}>
          {readOnly && (
            <div style={styles.readOnlyBanner}>
              <span style={styles.readOnlyText}>Seu acesso ao painel expirou. Voce pode visualizar, mas nao editar. Assine para reativar.</span>
            </div>
          )}
          <ProgressBar percentual={progresso} label="Progresso do planejamento" />
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Alertas</h2>
            <AlertCards pagamentos={pagamentos} tarefas={tarefas} />
          </section>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Navegacao</h2>
            <NavCards />
          </section>
        </main>
      </div>
      <style jsx global>{`
        :root {
          --color-primary: #8B6F5E;
          --color-secondary: #E5E0D9;
          --color-tertiary: #F9F7F4;
          --color-fundo: #F9F7F4;
          --color-text: #1A1714;
          --color-text-soft: #5C534A;
          --font-display: 'Cormorant Garamond', Georgia, serif;
          --font-body: 'DM Sans', Helvetica, Arial, sans-serif;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: var(--font-body); color: var(--color-text); background: var(--color-fundo); }
      `}</style>
    </>
  );
}

export async function getServerSideProps(context) {
  return getPainelServerSideProps(context);
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-fundo)' },
  main: { maxWidth: '960px', margin: '0 auto', padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: '24px' },
  section: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-primary)', fontWeight: 600 },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
};
EOF

echo "[10/14] Criando pages/painel/fornecedores.jsx..."
cat > pages/painel/fornecedores.jsx << 'EOF'
// pages/painel/fornecedores.jsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { getPainelServerSideProps } from '../../utils/painelServer';

const STATUS_LABELS = {
  a_contratar: 'A contratar', negociando: 'Negociando', contratado: 'Contratado',
  pago: 'Pago', pendente: 'Pendente', cancelado: 'Cancelado',
};
const STATUS_COLORS = {
  a_contratar: '#8B6F5E', negociando: '#1565C0', contratado: '#2E7D32',
  pago: '#00838F', pendente: '#F9A825', cancelado: '#C62828',
};

export default function FornecedoresPage({ readOnly }) {
  return (
    <ProtectedRoute>
      <FornecedoresContent readOnly={readOnly} />
    </ProtectedRoute>
  );
}

function FornecedoresContent({ readOnly }) {
  const { evento, signOut, supabase } = useAuth();
  const [fornecedores, setFornecedores] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => { if (evento) buscar(); }, [evento]);

  const buscar = async () => {
    const { data } = await supabase.from('fornecedores').select('*').eq('evento_id', evento.id).order('categoria');
    setFornecedores(data || []);
  };

  const salvar = async () => {
    if (readOnly) return;
    const payload = { ...form, evento_id: evento.id };
    if (form.id) { await supabase.from('fornecedores').update(payload).eq('id', form.id); }
    else { await supabase.from('fornecedores').insert(payload); }
    setModalAberto(false); setForm({}); buscar();
  };

  const excluir = async (id) => {
    if (readOnly) return;
    if (!confirm('Excluir fornecedor?')) return;
    await supabase.from('fornecedores').delete().eq('id', id);
    buscar();
  };

  const nomeCasal = evento ? `${evento.nome_pessoa1 || ''} & ${evento.nome_pessoa2 || ''}` : '';

  return (
    <>
      <Head><title>Fornecedores | descomplicai</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} onLogout={signOut} />
        <main style={styles.main}>
          <div style={styles.header}>
            <h1 style={styles.title}>Fornecedores</h1>
            {!readOnly && (
              <button onClick={() => { setForm({}); setModalAberto(true); }} style={styles.btnPrimary}>
                <Icon name="plus" size={16} color="#fff" /> Adicionar
              </button>
            )}
          </div>
          {readOnly && (
            <div style={styles.readOnlyBanner}><span style={styles.readOnlyText}>Modo somente leitura. Assine para editar.</span></div>
          )}
          <div style={styles.grid}>
            {fornecedores.map((f) => (
              <div key={f.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.categoria}>{f.categoria}</span>
                  <span style={{ ...styles.badge, background: STATUS_COLORS[f.status] || '#8B6F5E' }}>{STATUS_LABELS[f.status] || f.status}</span>
                </div>
                <h3 style={styles.nome}>{f.nome}</h3>
                <p style={styles.empresa}>{f.empresa}</p>
                <div style={styles.contatos}>
                  {f.telefone && <span><Icon name="phone" size={12} /> {f.telefone}</span>}
                  {f.email && <span><Icon name="mail" size={12} /> {f.email}</span>}
                </div>
                <div style={styles.valores}>
                  <span>Total: <strong>R$ {(f.valor_total || 0).toLocaleString('pt-BR')}</strong></span>
                  <span>Entrada: R$ {(f.valor_entrada || 0).toLocaleString('pt-BR')}</span>
                  <span>Saldo: R$ {(f.valor_saldo || 0).toLocaleString('pt-BR')}</span>
                </div>
                {!readOnly && (
                  <div style={styles.acoes}>
                    <button onClick={() => { setForm(f); setModalAberto(true); }} style={styles.btnIcon}><Icon name="edit" size={16} /></button>
                    <button onClick={() => excluir(f.id)} style={styles.btnIcon}><Icon name="trash" size={16} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      {modalAberto && !readOnly && (
        <div style={styles.modalOverlay} onClick={() => setModalAberto(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{form.id ? 'Editar' : 'Novo'} Fornecedor</h2>
            <input style={styles.input} placeholder="Nome" value={form.nome || ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <input style={styles.input} placeholder="Empresa" value={form.empresa || ''} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
            <input style={styles.input} placeholder="Categoria" value={form.categoria || ''} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
            <input style={styles.input} placeholder="Telefone" value={form.telefone || ''} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            <input style={styles.input} placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input style={styles.input} placeholder="Instagram" value={form.instagram || ''} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
            <input style={styles.input} placeholder="Site" value={form.site || ''} onChange={(e) => setForm({ ...form, site: e.target.value })} />
            <input style={styles.input} placeholder="Servico" value={form.servico || ''} onChange={(e) => setForm({ ...form, servico: e.target.value })} />
            <input style={styles.input} placeholder="Valor Total" type="number" value={form.valor_total || ''} onChange={(e) => setForm({ ...form, valor_total: Number(e.target.value) })} />
            <input style={styles.input} placeholder="Entrada" type="number" value={form.valor_entrada || ''} onChange={(e) => setForm({ ...form, valor_entrada: Number(e.target.value) })} />
            <select style={styles.input} value={form.status || 'a_contratar'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <textarea style={styles.textarea} placeholder="Notas" value={form.notas || ''} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
            <div style={styles.modalBotoes}>
              <button onClick={() => setModalAberto(false)} style={styles.btnSecondary}>Cancelar</button>
              <button onClick={salvar} style={styles.btnPrimary}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export async function getServerSideProps(context) {
  return getPainelServerSideProps(context);
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-fundo)' },
  main: { maxWidth: '960px', margin: '0 auto', padding: '20px 16px 40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-primary)' },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  btnSecondary: { background: 'var(--color-secondary)', color: 'var(--color-text)', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--color-text-soft)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr', gap: '12px' },
  card: { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-secondary)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  categoria: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-soft)' },
  badge: { color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 },
  nome: { fontSize: '17px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '2px' },
  empresa: { fontSize: '13px', color: 'var(--color-text-soft)', marginBottom: '10px' },
  contatos: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--color-text-soft)', marginBottom: '10px' },
  valores: { display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--color-text-soft)', marginBottom: '10px', flexWrap: 'wrap' },
  acoes: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' },
  modal: { background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto' },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-primary)', marginBottom: '16px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-secondary)', marginBottom: '10px', fontSize: '14px', fontFamily: 'var(--font-body)' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-secondary)', marginBottom: '10px', fontSize: '14px', fontFamily: 'var(--font-body)', minHeight: '80px', resize: 'vertical' },
  modalBotoes: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
};
EOF

echo "[11/14] Criando pages/painel/financeiro.jsx..."
cat > pages/painel/financeiro.jsx << 'EOF'
// pages/painel/financeiro.jsx
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { getPainelServerSideProps } from '../../utils/painelServer';

export default function FinanceiroPage({ readOnly }) {
  return (
    <ProtectedRoute>
      <FinanceiroContent readOnly={readOnly} />
    </ProtectedRoute>
  );
}

function FinanceiroContent({ readOnly }) {
  const { evento, signOut, supabase } = useAuth();
  const [pagamentos, setPagamentos] = useState([]);

  useEffect(() => { if (evento) buscar(); }, [evento]);

  const buscar = async () => {
    const { data } = await supabase.from('pagamentos').select('*').eq('evento_id', evento.id).order('data_vencimento');
    setPagamentos(data || []);
  };

  const resumo = useMemo(() => {
    const total = evento?.orcamento_total || 0;
    const comprometido = pagamentos.reduce((s, p) => s + (p.valor_total || 0), 0);
    const pago = pagamentos.reduce((s, p) => s + (p.valor_pago || 0), 0);
    const saldo = comprometido - pago;
    return { total, comprometido, pago, saldo };
  }, [evento, pagamentos]);

  const porCategoria = useMemo(() => {
    const map = {};
    pagamentos.forEach((p) => { const cat = p.categoria || 'Outros'; map[cat] = (map[cat] || 0) + (p.valor_total || 0); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [pagamentos]);

  const nomeCasal = evento ? `${evento.nome_pessoa1 || ''} & ${evento.nome_pessoa2 || ''}` : '';

  return (
    <>
      <Head><title>Financeiro | descomplicai</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} onLogout={signOut} />
        <main style={styles.main}>
          <h1 style={styles.title}>Financeiro</h1>
          {readOnly && (
            <div style={styles.readOnlyBanner}><span style={styles.readOnlyText}>Modo somente leitura. Assine para editar.</span></div>
          )}
          <div style={styles.cards}>
            <div style={styles.card}><span style={styles.cardLabel}>Orcamento Total</span><span style={styles.cardValue}>R$ {resumo.total.toLocaleString('pt-BR')}</span></div>
            <div style={styles.card}><span style={styles.cardLabel}>Comprometido</span><span style={styles.cardValue}>R$ {resumo.comprometido.toLocaleString('pt-BR')}</span></div>
            <div style={styles.card}><span style={styles.cardLabel}>Pago</span><span style={styles.cardValue}>R$ {resumo.pago.toLocaleString('pt-BR')}</span></div>
            <div style={styles.card}><span style={styles.cardLabel}>Saldo a Pagar</span><span style={styles.cardValue}>R$ {resumo.saldo.toLocaleString('pt-BR')}</span></div>
          </div>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Distribuicao por Categoria</h2>
            <div style={styles.chart}>
              {porCategoria.map(([cat, val]) => {
                const pct = resumo.comprometido > 0 ? (val / resumo.comprometido) * 100 : 0;
                return (
                  <div key={cat} style={styles.chartRow}>
                    <span style={styles.chartLabel}>{cat}</span>
                    <div style={styles.chartTrack}><div style={{ ...styles.chartFill, width: `${pct}%` }} /></div>
                    <span style={styles.chartValue}>R$ {val.toLocaleString('pt-BR')}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Vencimentos</h2>
            <div style={styles.list}>
              {pagamentos.map((p) => (
                <div key={p.id} style={styles.listItem}>
                  <div style={styles.listInfo}>
                    <span style={styles.listName}>{p.nome}</span>
                    <span style={styles.listDate}><Icon name="calendar" size={12} /> {p.data_vencimento}</span>
                  </div>
                  <span style={styles.listValue}>R$ {(p.valor_saldo || 0).toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  return getPainelServerSideProps(context);
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-fundo)' },
  main: { maxWidth: '960px', margin: '0 auto', padding: '20px 16px 40px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-primary)', marginBottom: '20px' },
  cards: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' },
  card: { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' },
  cardLabel: { fontSize: '12px', color: 'var(--color-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardValue: { fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' },
  section: { marginBottom: '24px' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-primary)', marginBottom: '12px' },
  chart: { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-secondary)', display: 'flex', flexDirection: 'column', gap: '10px' },
  chartRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  chartLabel: { width: '100px', fontSize: '12px', color: 'var(--color-text)', flexShrink: 0 },
  chartTrack: { flex: 1, height: '8px', background: 'var(--color-secondary)', borderRadius: '4px', overflow: 'hidden' },
  chartFill: { height: '100%', background: 'var(--color-primary)', borderRadius: '4px' },
  chartValue: { width: '80px', fontSize: '12px', color: 'var(--color-text-soft)', textAlign: 'right', flexShrink: 0 },
  list: { background: '#fff', borderRadius: '12px', border: '1px solid var(--color-secondary)', overflow: 'hidden' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--color-secondary)' },
  listInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  listName: { fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' },
  listDate: { fontSize: '12px', color: 'var(--color-text-soft)', display: 'flex', alignItems: 'center', gap: '4px' },
  listValue: { fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
};
EOF

echo "[12/14] Criando pages/painel/checklist.jsx..."
cat > pages/painel/checklist.jsx << 'EOF'
// pages/painel/checklist.jsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { getPainelServerSideProps } from '../../utils/painelServer';

export default function ChecklistPage({ readOnly }) {
  return (
    <ProtectedRoute>
      <ChecklistContent readOnly={readOnly} />
    </ProtectedRoute>
  );
}

function ChecklistContent({ readOnly }) {
  const { evento, signOut, supabase } = useAuth();
  const [tarefas, setTarefas] = useState([]);
  const [novaTarefa, setNovaTarefa] = useState('');
  const [novoPrazo, setNovoPrazo] = useState('');
  const [editando, setEditando] = useState(null);
  const [editPrazo, setEditPrazo] = useState('');

  useEffect(() => { if (evento) buscar(); }, [evento]);

  const buscar = async () => {
    const { data } = await supabase.from('tarefas').select('*').eq('evento_id', evento.id).order('prazo', { ascending: true });
    const lista = data || [];
    setTarefas(lista);
    if (lista.length === 0) importarDoMemorial();
  };

  const importarDoMemorial = async () => {
    if (readOnly) return;
    const tarefasPadrao = [
      { titulo: 'Reservar o local da cerimonia', prazo: -180 },
      { titulo: 'Reservar o local da festa', prazo: -180 },
      { titulo: 'Contratar buffet', prazo: -150 },
      { titulo: 'Contratar fotografo', prazo: -150 },
      { titulo: 'Escolher vestido', prazo: -120 },
      { titulo: 'Enviar save the date', prazo: -120 },
      { titulo: 'Contratar decoracao', prazo: -90 },
      { titulo: 'Definir lista de convidados', prazo: -90 },
      { titulo: 'Enviar convites', prazo: -60 },
      { titulo: 'Teste de cabelo e maquiagem', prazo: -30 },
      { titulo: 'Reuniao final com cerimonialista', prazo: -7 },
      { titulo: 'Confirmar fornecedores', prazo: -3 },
    ];
    const dataEvento = evento?.data_evento ? new Date(evento.data_evento) : null;
    const aInserir = tarefasPadrao.map(t => ({
      evento_id: evento.id, titulo: t.titulo, concluida: false,
      prazo: dataEvento ? new Date(dataEvento.getTime() + t.prazo * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
    }));
    await supabase.from('tarefas').insert(aInserir);
    buscar();
  };

  const toggle = async (id, concluida) => {
    if (readOnly) return;
    await supabase.from('tarefas').update({ concluida: !concluida }).eq('id', id);
    buscar();
  };

  const adicionar = async () => {
    if (readOnly || !novaTarefa.trim()) return;
    await supabase.from('tarefas').insert({ evento_id: evento.id, titulo: novaTarefa, prazo: novoPrazo || null, concluida: false });
    setNovaTarefa(''); setNovoPrazo(''); buscar();
  };

  const salvarPrazo = async (id) => {
    if (readOnly || !editPrazo) return;
    await supabase.from('tarefas').update({ prazo: editPrazo }).eq('id', id);
    setEditando(null); setEditPrazo(''); buscar();
  };

  const excluir = async (id) => {
    if (readOnly || !confirm('Excluir tarefa?')) return;
    await supabase.from('tarefas').delete().eq('id', id);
    buscar();
  };

  const hoje = new Date();
  const grupos = {
    urgente: tarefas.filter(t => !t.concluida && t.prazo && new Date(t.prazo) < hoje),
    proximos: tarefas.filter(t => {
      if (t.concluida || !t.prazo) return false;
      const d = new Date(t.prazo);
      return d >= hoje && d <= new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
    }),
    futuros: tarefas.filter(t => !t.concluida && (!t.prazo || new Date(t.prazo) > new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000))),
    concluidos: tarefas.filter(t => t.concluida),
  };

  const nomeCasal = evento ? `${evento.nome_pessoa1 || ''} & ${evento.nome_pessoa2 || ''}` : '';

  return (
    <>
      <Head><title>Checklist | descomplicai</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} onLogout={signOut} />
        <main style={styles.main}>
          <h1 style={styles.title}>Checklist</h1>
          {readOnly && (
            <div style={styles.readOnlyBanner}><span style={styles.readOnlyText}>Modo somente leitura. Assine para editar.</span></div>
          )}
          {!readOnly && (
            <div style={styles.addBox}>
              <input style={styles.input} placeholder="Nova tarefa..." value={novaTarefa} onChange={e => setNovaTarefa(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionar()} />
              <input style={{ ...styles.input, width: '130px' }} type="date" value={novoPrazo} onChange={e => setNovoPrazo(e.target.value)} />
              <button onClick={adicionar} style={styles.btnPrimary}><Icon name="plus" size={16} color="#fff" /></button>
            </div>
          )}

          {Object.entries({
            urgente: { label: 'Urgente', color: '#C62828' },
            proximos: { label: 'Proximos 30 dias', color: '#F9A825' },
            futuros: { label: 'Futuros', color: '#1565C0' },
            concluidos: { label: 'Concluidos', color: '#2E7D32' },
          }).map(([key, meta]) => (
            grupos[key].length > 0 && (
              <section key={key} style={styles.section}>
                <h2 style={{ ...styles.sectionTitle, color: meta.color }}>{meta.label} ({grupos[key].length})</h2>
                <div style={styles.list}>
                  {grupos[key].map((t) => (
                    <div key={t.id} style={styles.item}>
                      {!readOnly ? (
                        <button onClick={() => toggle(t.id, t.concluida)} style={{ ...styles.checkbox, background: t.concluida ? 'var(--color-primary)' : 'transparent', borderColor: t.concluida ? 'var(--color-primary)' : 'var(--color-secondary)' }}>
                          {t.concluida && <Icon name="check" size={12} color="#fff" />}
                        </button>
                      ) : (
                        <div style={{ ...styles.checkbox, background: t.concluida ? 'var(--color-primary)' : 'transparent', borderColor: t.concluida ? 'var(--color-primary)' : 'var(--color-secondary)' }}>
                          {t.concluida && <Icon name="check" size={12} color="#fff" />}
                        </div>
                      )}
                      <div style={styles.itemText}>
                        <span style={{ ...styles.itemTitle, textDecoration: t.concluida ? 'line-through' : 'none', color: t.concluida ? 'var(--color-text-soft)' : 'var(--color-text)' }}>{t.titulo}</span>
                        {t.prazo && (
                          <span style={styles.itemDate}>
                            {editando === t.id && !readOnly ? (
                              <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input type="date" value={editPrazo} onChange={e => setEditPrazo(e.target.value)} style={{ ...styles.input, width: '120px', padding: '4px 8px', fontSize: '12px' }} />
                                <button onClick={() => salvarPrazo(t.id)} style={styles.btnMini}><Icon name="check" size={12} color="#fff" /></button>
                                <button onClick={() => { setEditando(null); setEditPrazo(''); }} style={styles.btnMiniCancel}>×</button>
                              </span>
                            ) : (
                              <span onClick={() => !readOnly && setEditando(t.id) && setEditPrazo(t.prazo)} style={!readOnly ? { cursor: 'pointer', textDecoration: 'underline' } : {}}>
                                <Icon name="calendar" size={10} /> {t.prazo} {!readOnly && '(clique para editar)'}
                              </span>
                            )}
                          </span>
                        )}
                        {!t.prazo && !t.concluida && !readOnly && (
                          <span style={{ ...styles.itemDate, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setEditando(t.id); setEditPrazo(''); }}>
                            <Icon name="calendar" size={10} /> Adicionar prazo
                          </span>
                        )}
                      </div>
                      {!readOnly && (
                        <button onClick={() => excluir(t.id)} style={styles.btnIcon}><Icon name="trash" size={14} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )
          ))}
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  return getPainelServerSideProps(context);
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-fundo)' },
  main: { maxWidth: '960px', margin: '0 auto', padding: '20px 16px 40px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-primary)', marginBottom: '20px' },
  addBox: { display: 'flex', gap: '8px', marginBottom: '20px' },
  input: { flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-secondary)', fontSize: '14px', fontFamily: 'var(--font-body)' },
  btnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--color-text-soft)' },
  btnMini: { background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnMiniCancel: { background: 'none', border: 'none', color: 'var(--color-text-soft)', cursor: 'pointer', fontSize: '14px', padding: '0 4px' },
  section: { marginBottom: '20px' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '10px' },
  list: { background: '#fff', borderRadius: '12px', border: '1px solid var(--color-secondary)', overflow: 'hidden' },
  item: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid var(--color-secondary)' },
  checkbox: { width: '20px', height: '20px', borderRadius: '4px', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, background: 'none' },
  itemText: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  itemTitle: { fontSize: '14px', fontWeight: 500 },
  itemDate: { fontSize: '11px', color: 'var(--color-text-soft)' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
};
EOF

echo "[13/14] Criando pages/painel/convidados.jsx..."
cat > pages/painel/convidados.jsx << 'EOF'
// pages/painel/convidados.jsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { getPainelServerSideProps } from '../../utils/painelServer';

export default function ConvidadosPage({ readOnly }) {
  return (
    <ProtectedRoute>
      <ConvidadosContent readOnly={readOnly} />
    </ProtectedRoute>
  );
}

function ConvidadosContent({ readOnly }) {
  const { evento, signOut, supabase } = useAuth();
  const [convidados, setConvidados] = useState([]);
  const [novoNome, setNovoNome] = useState('');
  const [novoGrupo, setNovoGrupo] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novaMesa, setNovaMesa] = useState('');
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => { if (evento) buscar(); }, [evento]);

  const buscar = async () => {
    const { data } = await supabase.from('convidados').select('*').eq('evento_id', evento.id).order('nome');
    setConvidados(data || []);
  };

  const adicionar = async () => {
    if (readOnly || !novoNome.trim()) return;
    await supabase.from('convidados').insert({
      evento_id: evento.id, nome: novoNome, grupo: novoGrupo || 'Geral',
      telefone: novoTelefone || null, mesa: novaMesa ? parseInt(novaMesa) : null, status: 'pendente',
    });
    setNovoNome(''); setNovoGrupo(''); setNovoTelefone(''); setNovaMesa(''); buscar();
  };

  const atualizarStatus = async (id, status) => {
    if (readOnly) return;
    await supabase.from('convidados').update({ status }).eq('id', id); buscar();
  };

  const atualizarMesa = async (id, mesa) => {
    if (readOnly) return;
    const val = mesa ? parseInt(mesa) : null;
    await supabase.from('convidados').update({ mesa: val }).eq('id', id); buscar();
  };

  const excluir = async (id) => {
    if (readOnly || !confirm('Excluir convidado?')) return;
    await supabase.from('convidados').delete().eq('id', id); buscar();
  };

  const exportarCSV = () => {
    const headers = ['Nome', 'Grupo', 'Telefone', 'Status', 'Mesa'];
    const rows = convidados.map(c => [c.nome, c.grupo, c.telefone || '', c.status, c.mesa || '']);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `convidados-${evento?.nome_pessoa1 || 'casamento'}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const resumo = {
    total: convidados.length,
    confirmados: convidados.filter(c => c.status === 'confirmado').length,
    pendentes: convidados.filter(c => c.status === 'pendente').length,
    recusados: convidados.filter(c => c.status === 'recusado').length,
  };

  const filtrados = filtro === 'todos' ? convidados : convidados.filter(c => c.status === filtro);
  const nomeCasal = evento ? `${evento.nome_pessoa1 || ''} & ${evento.nome_pessoa2 || ''}` : '';

  return (
    <>
      <Head><title>Convidados | descomplicai</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} onLogout={signOut} />
        <main style={styles.main}>
          <h1 style={styles.title}>Convidados</h1>
          {readOnly && (
            <div style={styles.readOnlyBanner}><span style={styles.readOnlyText}>Modo somente leitura. Assine para editar.</span></div>
          )}
          <div style={styles.resumo}>
            <div style={styles.resumoCard}><span style={styles.resumoValue}>{resumo.total}</span><span style={styles.resumoLabel}>Total</span></div>
            <div style={styles.resumoCard}><span style={{ ...styles.resumoValue, color: '#2E7D32' }}>{resumo.confirmados}</span><span style={styles.resumoLabel}>Confirmados</span></div>
            <div style={styles.resumoCard}><span style={{ ...styles.resumoValue, color: '#F9A825' }}>{resumo.pendentes}</span><span style={styles.resumoLabel}>Pendentes</span></div>
            <div style={styles.resumoCard}><span style={{ ...styles.resumoValue, color: '#C62828' }}>{resumo.recusados}</span><span style={styles.resumoLabel}>Recusados</span></div>
          </div>

          {!readOnly && (
            <div style={styles.addBox}>
              <input style={styles.input} placeholder="Nome" value={novoNome} onChange={e => setNovoNome(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionar()} />
              <input style={{ ...styles.input, width: '120px' }} placeholder="Grupo" value={novoGrupo} onChange={e => setNovoGrupo(e.target.value)} />
              <input style={{ ...styles.input, width: '120px' }} placeholder="Telefone" value={novoTelefone} onChange={e => setNovoTelefone(e.target.value)} />
              <input style={{ ...styles.input, width: '70px' }} placeholder="Mesa" type="number" value={novaMesa} onChange={e => setNovaMesa(e.target.value)} />
              <button onClick={adicionar} style={styles.btnPrimary}><Icon name="plus" size={16} color="#fff" /></button>
            </div>
          )}

          <div style={styles.filtros}>
            {['todos', 'confirmado', 'pendente', 'recusado'].map((f) => (
              <button key={f} onClick={() => setFiltro(f)} style={{ ...styles.filtroBtn, background: filtro === f ? 'var(--color-primary)' : 'var(--color-secondary)', color: filtro === f ? '#fff' : 'var(--color-text)' }}>
                {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div style={styles.list}>
            {filtrados.map((c) => (
              <div key={c.id} style={styles.item}>
                <div style={styles.itemInfo}>
                  <span style={styles.itemNome}>{c.nome}</span>
                  <span style={styles.itemGrupo}>{c.grupo} {c.telefone && `· ${c.telefone}`}</span>
                </div>
                <div style={styles.itemAcoes}>
                  <input type="number" placeholder="Mesa" value={c.mesa || ''} onChange={e => atualizarMesa(c.id, e.target.value)} readOnly={readOnly} style={{ ...styles.input, width: '60px', padding: '6px 8px', fontSize: '13px', background: readOnly ? '#f5f5f5' : '#fff' }} />
                  <select value={c.status} onChange={e => atualizarStatus(c.id, e.target.value)} disabled={readOnly} style={styles.select}>
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="recusado">Recusado</option>
                  </select>
                  {!readOnly && (
                    <button onClick={() => excluir(c.id)} style={styles.btnIcon}><Icon name="trash" size={14} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!readOnly && (
            <div style={{ marginTop: '16px' }}>
              <button onClick={exportarCSV} style={styles.btnSecondary}><Icon name="download" size={16} /> CSV</button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  return getPainelServerSideProps(context);
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-fundo)' },
  main: { maxWidth: '960px', margin: '0 auto', padding: '20px 16px 40px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-primary)', marginBottom: '20px' },
  resumo: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' },
  resumoCard: { background: '#fff', borderRadius: '10px', padding: '12px', border: '1px solid var(--color-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  resumoValue: { fontSize: '22px', fontWeight: 700, color: 'var(--color-text)' },
  resumoLabel: { fontSize: '11px', color: 'var(--color-text-soft)', textTransform: 'uppercase' },
  addBox: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  input: { flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-secondary)', fontSize: '14px', minWidth: '80px' },
  btnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnSecondary: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-secondary)', color: 'var(--color-text)', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--color-text-soft)' },
  filtros: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  filtroBtn: { padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500 },
  list: { background: '#fff', borderRadius: '12px', border: '1px solid var(--color-secondary)', overflow: 'hidden' },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--color-secondary)', flexWrap: 'wrap', gap: '8px' },
  itemInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  itemNome: { fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' },
  itemGrupo: { fontSize: '12px', color: 'var(--color-text-soft)' },
  itemAcoes: { display: 'flex', alignItems: 'center', gap: '8px' },
  select: { padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-secondary)', fontSize: '13px', background: '#fff' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
};
EOF

echo "[14/14] Criando pages/painel/cronograma.jsx..."
cat > pages/painel/cronograma.jsx << 'EOF'
// pages/painel/cronograma.jsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { getPainelServerSideProps } from '../../utils/painelServer';

export default function CronogramaPage({ readOnly }) {
  return (
    <ProtectedRoute>
      <CronogramaContent readOnly={readOnly} />
    </ProtectedRoute>
  );
}

function CronogramaContent({ readOnly }) {
  const { evento, signOut, supabase } = useAuth();
  const [itens, setItens] = useState([]);
  const [novoHora, setNovoHora] = useState('');
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoLocal, setNovoLocal] = useState('');
  const [novoResp, setNovoResp] = useState('');
  const [editando, setEditando] = useState(null);

  useEffect(() => { if (evento) buscar(); }, [evento]);

  const buscar = async () => {
    const { data } = await supabase.from('cronograma').select('*').eq('evento_id', evento.id).order('hora');
    if (data?.length) { setItens(data); }
    else { gerarDoMemorial(); }
  };

  const gerarDoMemorial = async () => {
    if (readOnly) { setItens([]); return; }
    const { data: mem } = await supabase.from('memoriais').select('*').eq('evento_id', evento.id).limit(1).single();
    const base = mem?.conteudo || mem?.texto || '';
    const padrao = [
      { hora: '14:00', titulo: 'Chegada dos fornecedores', local: 'Salao', responsavel: 'Cerimonialista' },
      { hora: '15:30', titulo: 'Inicio da cerimonia', local: 'Altar', responsavel: 'Celebrante' },
      { hora: '16:30', titulo: 'Coquetel de recepcao', local: 'Jardim', responsavel: 'Buffet' },
      { hora: '18:00', titulo: 'Inicio do jantar', local: 'Salao principal', responsavel: 'Buffet' },
      { hora: '20:00', titulo: 'Abertura da pista', local: 'Salao principal', responsavel: 'DJ/Banda' },
      { hora: '23:00', titulo: 'Saida dos noivos', local: 'Portaria', responsavel: 'Cerimonialista' },
    ];
    setItens(padrao);
  };

  const salvar = async () => {
    if (readOnly || !novoHora || !novoTitulo.trim()) return;
    const payload = { evento_id: evento.id, hora: novoHora, titulo: novoTitulo, local: novoLocal, responsavel: novoResp };
    if (editando) { await supabase.from('cronograma').update(payload).eq('id', editando); setEditando(null); }
    else { await supabase.from('cronograma').insert(payload); }
    setNovoHora(''); setNovoTitulo(''); setNovoLocal(''); setNovoResp(''); buscar();
  };

  const editar = (item) => {
    if (readOnly) return;
    setNovoHora(item.hora); setNovoTitulo(item.titulo); setNovoLocal(item.local || ''); setNovoResp(item.responsavel || ''); setEditando(item.id);
  };

  const excluir = async (id) => {
    if (readOnly || !confirm('Excluir item?')) return;
    await supabase.from('cronograma').delete().eq('id', id); buscar();
  };

  const nomeCasal = evento ? `${evento.nome_pessoa1 || ''} & ${evento.nome_pessoa2 || ''}` : '';

  return (
    <>
      <Head><title>Cronograma | descomplicai</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} onLogout={signOut} />
        <main style={styles.main}>
          <h1 style={styles.title}>Cronograma do Dia</h1>
          {readOnly && (
            <div style={styles.readOnlyBanner}><span style={styles.readOnlyText}>Modo somente leitura. Assine para editar.</span></div>
          )}
          {!readOnly && (
            <div style={styles.form}>
              <input style={{ ...styles.input, width: '80px' }} type="time" value={novoHora} onChange={e => setNovoHora(e.target.value)} />
              <input style={styles.input} placeholder="Titulo" value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} />
              <input style={{ ...styles.input, width: '140px' }} placeholder="Local" value={novoLocal} onChange={e => setNovoLocal(e.target.value)} />
              <input style={{ ...styles.input, width: '140px' }} placeholder="Responsavel" value={novoResp} onChange={e => setNovoResp(e.target.value)} />
              <button onClick={salvar} style={styles.btnPrimary}><Icon name={editando ? 'check' : 'plus'} size={16} color="#fff" /></button>
              {editando && <button onClick={() => { setEditando(null); setNovoHora(''); setNovoTitulo(''); setNovoLocal(''); setNovoResp(''); }} style={styles.btnSecondary}>Cancelar</button>}
            </div>
          )}

          <div style={styles.timeline}>
            <div style={styles.line} />
            {itens.sort((a, b) => a.hora.localeCompare(b.hora)).map((item, i) => (
              <div key={item.id || i} style={styles.item}>
                <div style={styles.dot} />
                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.hora}>{item.hora}</span>
                    <span style={styles.titulo}>{item.titulo}</span>
                  </div>
                  <div style={styles.cardMeta}>
                    {item.local && <span><Icon name="map" size={12} /> {item.local}</span>}
                    {item.responsavel && <span>· Responsavel: {item.responsavel}</span>}
                  </div>
                  {!readOnly && (
                    <div style={styles.cardAcoes}>
                      <button onClick={() => editar(item)} style={styles.btnIcon}><Icon name="edit" size={14} /></button>
                      <button onClick={() => excluir(item.id)} style={styles.btnIcon}><Icon name="trash" size={14} /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  return getPainelServerSideProps(context);
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-fundo)' },
  main: { maxWidth: '720px', margin: '0 auto', padding: '20px 16px 40px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-primary)', marginBottom: '20px' },
  form: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' },
  input: { flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-secondary)', fontSize: '14px', minWidth: '100px' },
  btnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' },
  btnSecondary: { background: 'var(--color-secondary)', color: 'var(--color-text)', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-text-soft)' },
  timeline: { position: 'relative', paddingLeft: '28px' },
  line: { position: 'absolute', left: '10px', top: 0, bottom: 0, width: '2px', background: 'var(--color-secondary)' },
  item: { position: 'relative', marginBottom: '16px' },
  dot: { position: 'absolute', left: '-24px', top: '14px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)', border: '2px solid var(--color-fundo)' },
  card: { background: '#fff', borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--color-secondary)' },
  cardHeader: { display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' },
  hora: { fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)' },
  titulo: { fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' },
  cardMeta: { fontSize: '12px', color: 'var(--color-text-soft)', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' },
  cardAcoes: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
};
EOF

echo ""
echo "========================================"
echo "  TUDO PRONTO!"
echo "========================================"
echo ""
echo "Arquivos criados:"
echo "  utils/acesso.js"
echo "  utils/painelServer.js"
echo "  hooks/useAuth.js"
echo "  components/painel/ProtectedRoute.jsx"
echo "  pages/api/pagamento/criar.js"
echo "  pages/api/pagamento/webhook.js"
echo "  pages/api/evento/trial.js"
echo "  pages/memorial/conclusao.jsx"
echo "  pages/painel/index.jsx"
echo "  pages/painel/fornecedores.jsx"
echo "  pages/painel/financeiro.jsx"
echo "  pages/painel/checklist.jsx"
echo "  pages/painel/convidados.jsx"
echo "  pages/painel/cronograma.jsx"
echo ""
echo "SQL que ainda precisa rodar no Supabase:"
echo ""
cat << 'SQL'
ALTER TABLE eventos DROP CONSTRAINT IF EXISTS eventos_plano_check;
ALTER TABLE eventos ADD CONSTRAINT eventos_plano_check
  CHECK (plano IN ('gratuito','trial','pdf','mensal','3_meses','6_meses','12_meses','18_meses'));

ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS duracao_meses integer;
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS aceite_termo_em timestamp;
SQL
echo ""
echo "Agora eh so dar 'npm run dev' e testar."
echo "========================================"