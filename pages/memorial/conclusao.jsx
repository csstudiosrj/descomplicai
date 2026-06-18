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
import MarkdownRenderer from '../../components/ui/MarkdownRenderer';
import { temAcessoPainel } from '../../utils/acesso';

const PLANOS_ASSINATURA = [
  { id: 'mensal', label: 'Mensal', preco: 'R$59,90/mes', duracao: 1 },
  { id: '3_meses', label: '3 Meses', preco: 'R$149,70', duracao: 3 },
  { id: '6_meses', label: '6 Meses', preco: 'R$239,40', duracao: 6 },
  { id: '12_meses', label: '12 Meses', preco: 'R$418,80', duracao: 12 },
  { id: '18_meses', label: '18 Meses', preco: 'R$538,20', duracao: 18 },
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
          <MarkdownRenderer text={conteudoMemorial} />
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
                <span>Entendo que este PDF é personalizado para o meu casamento com base nas minhas respostas, é gerado e entregue imediatamente após a confirmação do pagamento, e que, por sua natureza personalizada, não há devolução após a geração.</span>
              </label>
              <Button variant="primary" size="lg" fullWidth loading={pagando} onClick={handleComprarPDF}>
                {pagando ? 'Redirecionando...' : 'Baixar PDF completo — R$197'}
              </Button>
            </>
          )}

          {!temAcesso && (
            <>
              {pdfLiberado && (
                <div style={{ padding: '24px', backgroundColor: 'rgba(16,185,129,0.05)', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.35)', marginTop: '16px' }}>
                  <p style={{ fontSize: '11px', color: '#0b7a56', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>gestão completa</p>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '21px', color: '#1a1714', marginBottom: '12px', lineHeight: '1.3', fontWeight: 600 }}>Coloque seu casamento no painel</h3>
                  <p style={{ fontSize: '14px', color: '#5c534a', marginBottom: '20px', lineHeight: '1.5', fontFamily: 'var(--font-body)' }}>Fornecedores, orçamento e prazos, tudo num só lugar, até o grande dia.</p>
                  <button
                    onClick={() => setModalPlanos(true)}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      borderRadius: '12px',
                      border: '1.5px solid #10B981',
                      backgroundColor: 'transparent',
                      color: '#0b7a56',
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    Testar grátis por 7 dias
                    <span style={{ fontSize: '18px' }}>→</span>
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '12px', color: '#8b7e6e', marginTop: '12px', fontFamily: 'var(--font-body)' }}>sem cartão de crédito · sem compromisso</p>
                </div>
              )}

              {!pdfLiberado && (
                <>
                  {!trialJaIniciado ? (
                    <>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={aceiteTermosTrial} onChange={(e) => setAceiteTermosTrial(e.target.checked)} style={{ marginTop: '2px' }} />
                        <span>Ao iniciar o teste gratuito, você concorda em começar a usar o serviço de gestão do Descomplicaí agora. O prazo de reflexão de 7 dias previsto no artigo 49 do Código de Defesa do Consumidor passa a contar a partir deste momento — não a partir de uma eventual assinatura paga feita depois.</span>
                      </label>
                      <Button variant="secondary" size="lg" fullWidth loading={iniciandoTrial} onClick={handleIniciarTrial}>
                        {iniciandoTrial ? 'Iniciando...' : 'Gerenciar meu casamento — 7 dias gratis'}
                      </Button>
                    </>
                  ) : (
                    <div style={{ padding: '24px', backgroundColor: 'rgba(16,185,129,0.05)', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.35)', marginTop: '16px' }}>
                      <p style={{ fontSize: '11px', color: '#0b7a56', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>gestão completa</p>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '21px', color: '#1a1714', marginBottom: '12px', lineHeight: '1.3', fontWeight: 600 }}>Coloque seu casamento no painel</h3>
                      <p style={{ fontSize: '14px', color: '#5c534a', marginBottom: '20px', lineHeight: '1.5', fontFamily: 'var(--font-body)' }}>Fornecedores, orçamento e prazos, tudo num só lugar, até o grande dia.</p>
                      <button
                        onClick={() => setModalPlanos(true)}
                        style={{
                          width: '100%',
                          padding: '14px 20px',
                          borderRadius: '12px',
                          border: '1.5px solid #10B981',
                          backgroundColor: 'transparent',
                          color: '#0b7a56',
                          fontFamily: 'var(--font-body)',
                          fontSize: '15px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        Testar grátis por 7 dias
                        <span style={{ fontSize: '18px' }}>→</span>
                      </button>
                      <p style={{ textAlign: 'center', fontSize: '12px', color: '#8b7e6e', marginTop: '12px', fontFamily: 'var(--font-body)' }}>sem cartão de crédito · sem compromisso</p>
                    </div>
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