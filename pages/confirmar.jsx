// pages/confirmar.jsx
/**
 * Página de confirmação de email — detecta sessão do Supabase na URL,
 * recupera draft do memorial e cria evento + memorial real.
 *
 * Fluxo:
 * 1. Usuário clica no link de confirmação do email
 * 2. Supabase injeta #access_token=... na URL
 * 3. detectSessionInUrl: true → sessão criada automaticamente
 * 4. Buscamos draft_token da query
 * 5. Buscamos draft no Supabase
 * 6. Chamamos /api/memorial/criar-evento com o estado do draft
 * 7. Redirecionamos para /descomplicai/memorial
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import fetchAPI from '../utils/fetchAPI';

const ESTADOS = {
  VERIFICANDO: 'verificando',
  CRIANDO_EVENTO: 'criando_evento',
  SUCESSO: 'sucesso',
  ERRO: 'erro',
};

export default function ConfirmarPage() {
  const router = useRouter();
  const [estado, setEstado] = useState(ESTADOS.VERIFICANDO);
  const [mensagem, setMensagem] = useState('Confirmando seu email...');
  const [erro, setErro] = useState('');
  const [tentativas, setTentativas] = useState(0);

  const draftId = router.query.draft_id;

  useEffect(() => {
    if (!router.isReady) return;

    async function processarConfirmacao() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
          if (tentativas < 5) {
            setTentativas(prev => prev + 1);
            setTimeout(processarConfirmacao, 1000);
            setMensagem(`Confirmando seu email${'.'.repeat(tentativas + 1)}`);
            return;
          }
          throw new Error('Nao foi possivel confirmar seu email. Tente fazer login.');
        }

        setEstado(ESTADOS.CRIANDO_EVENTO);
        setMensagem('Preparando seu memorial...');

        let estadoMemorial = null;
        if (draftId) {
          try {
            const res = await fetchAPI(`/api/memorial/buscar-draft?draft_id=${encodeURIComponent(draftId)}`);
            const result = await res.json();
            if (result.sucesso && result.estado) {
              estadoMemorial = result.estado;
            }
          } catch (draftErr) {
            console.warn('[confirmar] Erro ao buscar draft:', draftErr);
          }
        }

        if (estadoMemorial) {
          try {
            const res = await fetchAPI('/api/memorial/criar-evento', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ estado: estadoMemorial }),
            });

            const result = await res.json();
            if (!res.ok) {
              console.warn('[confirmar] Erro ao criar evento:', result.erro || result.error);
            } else {
              console.log('[confirmar] Evento criado:', result.evento_id);
            }
          } catch (apiErr) {
            console.warn('[confirmar] Falha na API criar-evento:', apiErr);
          }
        }

        try {
          localStorage.removeItem('memorial_estado');
        } catch {}

        setEstado(ESTADOS.SUCESSO);
        setMensagem('Tudo pronto! Redirecionando...');
        router.push('/descomplicai/memorial');
      } catch (err) {
        console.error('[confirmar] Erro:', err);
        setEstado(ESTADOS.ERRO);
        setErro(err.message || 'Erro ao confirmar email. Tente fazer login.');
      }
    }

    processarConfirmacao();
  }, [router.isReady, draftId, tentativas]);

  return (
    <>
      <Head>
        <title>Confirmando seu email — Descomplicaí</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-off-white)',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-6)',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: estado === ESTADOS.ERRO ? 'var(--color-danger-light)' : 'var(--color-success-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-2)',
          }}>
            {estado === ESTADOS.ERRO ? (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                <circle cx="12" cy="16" r="1" fill="var(--color-success)" />
              </svg>
            )}
          </div>

          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-3)',
            }}>
              {estado === ESTADOS.ERRO ? 'Ops, algo deu errado' : 'Quase lá!'}
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              fontSize: 'var(--text-base)',
            }}>
              {mensagem}
            </p>
          </div>

          {estado === ESTADOS.VERIFICANDO && (
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--color-brand)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          )}

          {erro && (
            <div role="alert" style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              width: '100%',
            }}>
              {erro}
            </div>
          )}

          {estado === ESTADOS.ERRO && (
            <button
              onClick={() => router.push('/descomplicai/login')}
              style={{
                padding: 'var(--space-3) var(--space-6)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-brand)',
                color: 'white',
                border: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                cursor: 'pointer',
                fontWeight: 'var(--font-medium)',
              }}
            >
              Fazer login
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
