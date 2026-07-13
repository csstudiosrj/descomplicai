// pages/memorial/index.jsx
// Entry point do memorial — gerencia fluxo por fase na URL

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/ui/Header';
import MemorialOrchestrator from '../../components/memorial/MemorialOrchestrator';
import DNACasamento from '../../components/memorial/DNACasamento';
import { useAuth } from '../../hooks/useAuth';
import fetchAPI from '../../utils/fetchAPI';

export default function MemorialPage() {
  const router = useRouter();
  const { user, supabase, loading: carregandoAuth } = useAuth();
  const { fase } = router.query;

  const [verificando, setVerificando] = useState(true);
  const [temEvento, setTemEvento] = useState(false);
  const [dnaCompleto, setDnaCompleto] = useState(false);

  useEffect(() => {
    if (carregandoAuth) return;
    if (!router.isReady) return;

    async function verificarFluxo() {
      // Fase DNA: renderiza componente DNA
      if (fase === 'dna') {
        setVerificando(false);
        return;
      }

      // Fase 1+: renderiza orchestrator
      if (fase === '1' || fase === 'swipe') {
        setVerificando(false);
        return;
      }

      // Sem fase na URL: verifica estado do usuario
      const eventoIdLocal = localStorage.getItem('descomplicai-evento-id');
      const dnaLocal = localStorage.getItem('descomplicai-dna-completo');

      if (dnaLocal === '1' && eventoIdLocal) {
        // DNA completo, vai pro swipe
        setDnaCompleto(true);
        setTemEvento(true);
        router.replace('/memorial?fase=1', undefined, { shallow: true });
        return;
      }

      if (eventoIdLocal) {
        // Tem evento mas nao sabe se DNA completo
        if (user) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              const res = await fetchAPI(`/api/eventos/${eventoIdLocal}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
              });
              if (res.ok) {
                const evento = await res.json();
                if (evento.estilo && evento.tipo_cerimonia && evento.tipo_local) {
                  // DNA ja completo no banco
                  localStorage.setItem('descomplicai-dna-completo', '1');
                  setDnaCompleto(true);
                  router.replace('/memorial?fase=1', undefined, { shallow: true });
                  return;
                }
              }
            }
          } catch (e) {
            console.warn('[MemorialPage] Erro ao verificar evento:', e);
          }
        }
        // Tem evento mas DNA incompleto
        setTemEvento(true);
        setDnaCompleto(false);
        router.replace('/memorial?fase=dna', undefined, { shallow: true });
        return;
      }

      // Sem evento local — verifica no banco se logado
      if (user) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const res = await fetchAPI('/api/eventos/meus-eventos', {
              headers: { 'Authorization': `Bearer ${session.access_token}` },
            });
            if (res.ok) {
              const eventos = await res.json();
              if (eventos?.length > 0) {
                const evento = eventos[0];
                localStorage.setItem('descomplicai-evento-id', evento.id);
                setTemEvento(true);
                if (evento.estilo && evento.tipo_cerimonia && evento.tipo_local) {
                  localStorage.setItem('descomplicai-dna-completo', '1');
                  setDnaCompleto(true);
                  router.replace('/memorial?fase=1', undefined, { shallow: true });
                } else {
                  setDnaCompleto(false);
                  router.replace('/memorial?fase=dna', undefined, { shallow: true });
                }
                return;
              }
            }
          }
        } catch (e) {
          console.warn('[MemorialPage] Erro ao buscar eventos:', e);
        }
      }

      // Sem evento: redireciona para perfil
      router.replace('/memorial/perfil');
    }

    verificarFluxo();
  }, [router, router.isReady, fase, user, carregandoAuth, supabase]);

  // Renderiza conteudo conforme fase
  const renderConteudo = () => {
    if (fase === 'dna') {
      return <DNACasamento />;
    }
    if (fase === '1' || fase === 'swipe') {
      return <MemorialOrchestrator />;
    }
    // Fallback enquanto verifica
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60dvh' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
          Carregando...
        </p>
      </div>
    );
  };

  return (
    <>
      <Header />
      <main style={{ paddingTop: '52px', minHeight: '100dvh', boxSizing: 'border-box' }}>
        {renderConteudo()}
      </main>
    </>
  );
}
