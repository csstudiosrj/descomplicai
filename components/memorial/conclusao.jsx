// Página de conclusão do memorial — exibe resultado final e próximos passos
// Dependências diretas: React, next/router, next/head, MemorialConclusao, useMemorialContext

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemorialContext } from '../../context/MemorialContext';
import MemorialConclusao from '../../components/memorial/MemorialConclusao';

export default function MemorialConclusaoPage() {
  const router = useRouter();
  const { estado, resetarMemorial } = useMemorialContext();
  const [memorial, setMemorial] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!estado || !estado.memorialConcluido) return;

    async function gerar() {
      setCarregando(true);
      setErro('');
      try {
        const res = await fetch('/api/ia/gerar-memorial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado }),
        });
        const data = await res.json();
        if (data.sucesso) {
          setMemorial(data.memorial);
        } else {
          setErro(data.erro || 'Erro ao gerar memorial.');
        }
      } catch (e) {
        setErro('Erro de conexão. Verifique sua internet.');
      } finally {
        setCarregando(false);
      }
    }

    gerar();
  }, [estado]);

  const handleRecomecar = () => {
    resetarMemorial();
    router.push('/memorial');
  };

  const handleIrParaPainel = () => {
    router.push('/painel');
  };

  if (!estado || !estado.memorialConcluido) {
    return (
      <>
        <Head>
          <title>Conclusão — Descomplicaí</title>
        </Head>
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
          <div style={{ textAlign: 'center' }}>
            <p>Memorial não concluído.</p>
            <button
              onClick={() => router.push('/memorial')}
              style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--color-brand)', color: 'var(--color-white)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', cursor: 'pointer' }}
            >
              Começar memorial
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Memorial Concluído — Descomplicaí</title>
        <meta name="description" content="Seu memorial de casamento está pronto." />
      </Head>

      {carregando && !memorial && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal)', backgroundColor: 'var(--color-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--color-white)' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--color-white)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto var(--space-4)' }} />
            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)' }}>Gerando seu memorial...</p>
          </div>
        </div>
      )}

      {erro && (
        <div role="alert" style={{ maxWidth: '800px', margin: 'var(--space-6) auto', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', fontFamily: 'var(--font-body)' }}>
          {erro}
        </div>
      )}

      <MemorialConclusao
        estado={estado}
        memorialGerado={memorial}
        onRecomecar={handleRecomecar}
        onIrParaPainel={handleIrParaPainel}
      />
    </>
  );
}