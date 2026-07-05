// pages/memorial/conclusao.jsx
// Tela de conclusão do memorial — geração via IA e oferta dos planos (PDF/Assinatura)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { montarPayloadParaAPI } from '../../utils/gerador-memorial';
import { useAuth } from '../../hooks/useAuth';
import { useMemorial } from '../../hooks/useMemorial';
import Button from '../../components/ui/Button';
import fetchAPI from '../../utils/fetchAPI';

export default function ConclusaoPage() {
  const router = useRouter();
  const { estado } = useMemorial();
  const { usuario } = useAuth();

  const [status, setStatus] = useState('carregando'); // carregando | pronto | erro
  const [memorial, setMemorial] = useState('');
  const [erro, setErro] = useState('');
  const [baixandoPDF, setBaixandoPDF] = useState(false);

  useEffect(() => {
    if (!estado || !estado.etapaAtual) {
      router.replace('/memorial');
      return;
    }

    const gerarMemorial = async () => {
      try {
        const payload = montarPayloadParaAPI(estado);
        const resposta = await fetchAPI('/api/ia/gerar-memorial', {
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
  }, [estado, router]);

  const baixarPDF = async () => {
    setBaixandoPDF(true);
    try {
      const dadosEvento = montarPayloadParaAPI(estado);
      const response = await fetchAPI('/api/gerar-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memorial,
          dadosEvento,
        }),
      });

      if (!response.ok) throw new Error('Erro ao gerar PDF');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'memorial-descomplicai.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao baixar PDF:', err);
      alert('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setBaixandoPDF(false);
    }
  };

  if (status === 'carregando') {
    return (
      <div
        className="conclusao-container"
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-off-white)',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div
            className="spinner"
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--color-border)',
              borderTopColor: 'var(--color-brand)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto var(--space-6)',
            }}
          />
          <style jsx>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Gerando seu memorial...
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Estamos criando cada detalhe com inteligência artificial. Isso pode
            levar alguns segundos.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'erro') {
    return (
      <div
        className="conclusao-container"
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-off-white)',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-danger)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Ops!
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-6)',
            }}
          >
            {erro || 'Não foi possível gerar o memorial. Tente novamente.'}
          </p>
          <Button variant="primary" onClick={() => router.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // Exibe preview com blur abaixo da dobra
  const previewVisivel = memorial.substring(0, 800);
  const previewOculto = memorial.substring(800);

  return (
    <>
      <Head>
        <title>Seu memorial está pronto — Descomplicaí</title>
      </Head>
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: 'var(--space-6) var(--space-4) var(--space-24)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-4xl)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Memorial pronto!
          </h1>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-lg)',
            }}
          >
            Ele foi gerado com base nas suas escolhas. Confira um trecho:
          </p>
        </div>

        <div
          style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: 'var(--space-6)',
            backgroundColor: 'var(--color-white)',
            marginBottom: 'var(--space-8)',
          }}
        >
          <div
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            {previewVisivel}
          </div>
          {previewOculto && (
            <div
              style={{
                filter: 'blur(4px)',
                opacity: 0.4,
                marginTop: 'var(--space-4)',
                whiteSpace: 'pre-wrap',
                lineHeight: 'var(--leading-relaxed)',
              }}
            >
              {previewOculto}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={baixarPDF}
            loading={baixandoPDF}
          >
            {baixandoPDF
              ? 'Gerando PDF...'
              : 'Baixar PDF completo — R$197'}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => router.push('/planos?produto=assinatura')}
          >
            Gerenciar meu casamento — R$29,90/mês
          </Button>
        </div>

        <p
          style={{
            textAlign: 'center',
            marginTop: 'var(--space-6)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Seu memorial ficará salvo por 7 dias. Depois é só assinar para manter
          o acesso.
        </p>
      </div>
    </>
  );
}