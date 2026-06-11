// pages/memorial/conclusao.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { montarPayloadParaAPI } from '../../utils/gerador-memorial';
import { useAuth } from '../../hooks/useAuth';
import { useMemorial } from '../../hooks/useMemorial';
import Button from '../../components/ui/Button';

export default function ConclusaoPage() {
  const router = useRouter();
  const { estado, carregarEstado } = useMemorial();
  const { usuario } = useAuth();
  const [status, setStatus] = useState('carregando');
  const [memorial, setMemorial] = useState('');
  const [erro, setErro] = useState('');
  const [pagando, setPagando] = useState(false);
  const [baixandoPDF, setBaixandoPDF] = useState(false);
  const { pagamento: statusPagamento, tipo: tipoProduto, concluido } = router.query;

  useEffect(() => {
    // Tenta recuperar estado do localStorage
    try {
      const raw = localStorage.getItem('descomplicai-memorial-draft');
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft && draft.perfilCasal) {
          carregarEstado(draft);
          return;
        }
      }
    } catch (e) { /* ignora */ }

    // Se não encontrou e não veio da conclusão, redireciona
    if (!concluido) {
      router.replace('/memorial');
      return;
    }

    // Se veio da conclusão mas não tem estado, mostra erro
    setStatus('erro');
    setErro('Dados do memorial não encontrados. Tente finalizar novamente.');
  }, []);

  useEffect(() => {
    if (!estado || !estado.etapaAtual) return;

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
  }, [estado]);

  const iniciarPagamento = async (tipo) => {
    setPagando(true);
    try {
      localStorage.setItem('descomplicai-memorial-draft', JSON.stringify(estado));

      const resposta = await fetch('/api/pagamento/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo }),
      });

      const data = await resposta.json();
      if (!resposta.ok || !data.sucesso) {
        throw new Error(data.erro || 'Erro ao criar pagamento');
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error(err);
      alert('Não foi possível iniciar o pagamento. Tente novamente.');
    } finally {
      setPagando(false);
    }
  };

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
        throw new Error('Erro ao gerar PDF');
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
      alert('Não foi possível baixar o PDF. Tente novamente.');
    } finally {
      setBaixandoPDF(false);
    }
  };

  if (status === 'carregando') {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', backgroundColor: 'var(--color-off-white)' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto var(--space-6)' }} />
          <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>Gerando seu memorial...</h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>Estamos criando cada detalhe. Isso leva apenas alguns segundos.</p>
        </div>
      </div>
    );
  }

  if (status === 'erro') {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', backgroundColor: 'var(--color-off-white)' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-danger)', marginBottom: 'var(--space-2)' }}>Ops!</h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>{erro || 'Não foi possível gerar o memorial. Tente novamente.'}</p>
          <Button variant="primary" onClick={() => router.push('/memorial')}>Voltar ao memorial</Button>
        </div>
      </div>
    );
  }

  const previewVisivel = memorial.substring(0, 800);
  const pagamentoAprovado = statusPagamento === 'sucesso';

  return (
    <>
      <Head>
        <title>Seu memorial está pronto — Descomplicaí</title>
      </Head>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'var(--space-6) var(--space-4) var(--space-8)', fontFamily: 'var(--font-body)' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>Memorial pronto!</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)' }}>
            {pagamentoAprovado
              ? 'Seu pagamento foi aprovado! Baixe o PDF completo.'
              : 'Ele foi gerado com base nas suas escolhas. Confira um trecho:'}
          </p>
        </div>

        <div style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 'var(--space-6)', backgroundColor: 'var(--color-white)', marginBottom: 'var(--space-6)' }}>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 'var(--leading-relaxed)' }}>{previewVisivel}</div>
          {memorial.length > 800 && !pagamentoAprovado && (
            <div style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-off-white) 100%)',
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-relaxed)',
              border: '1px dashed var(--color-border)',
            }}>
              O conteúdo completo do memorial está disponível após a compra do PDF ou assinatura do plano.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          {pagamentoAprovado ? (
            <>
              <Button variant="primary" size="lg" fullWidth loading={baixandoPDF} onClick={baixarPDF}>
                {baixandoPDF ? 'Gerando PDF...' : 'Baixar PDF completo'}
              </Button>
              <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Seu PDF está liberado! Clique no botão acima para fazer o download.
              </p>
            </>
          ) : (
            <>
              <Button variant="primary" size="lg" fullWidth loading={pagando} onClick={() => iniciarPagamento('memorial_pdf')}>
                {pagando ? 'Redirecionando...' : 'Baixar PDF completo — R$197'}
              </Button>
              <Button variant="secondary" size="lg" fullWidth loading={pagando} onClick={() => iniciarPagamento('assinatura')}>
                {pagando ? 'Redirecionando...' : 'Gerenciar meu casamento — R$29,90/mês'}
              </Button>
            </>
          )}
        </div>

        {statusPagamento === 'pendente' && (
          <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: '#FFF3E6', borderRadius: 'var(--radius-md)', color: 'var(--color-warning-dark)', fontFamily: 'var(--font-body)' }}>
            Pagamento em processamento. Assim que confirmado, você receberá o acesso.
          </div>
        )}

        {!pagamentoAprovado && (
          <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Seu memorial ficará salvo por 7 dias. Depois é só assinar para manter o acesso.
          </p>
        )}
      </div>
    </>
  );
}