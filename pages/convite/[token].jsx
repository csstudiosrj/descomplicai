import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import fetchAPI from '../../utils/fetchAPI';

export default function PaginaConviteEvento() {
  const router = useRouter();
  const { token } = router.query;
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [aceitando, setAceitando] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!token) return;

    async function buscarDados() {
      try {
        const res = await fetchAPI(`/api/convite/validar?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setErro(data.error || 'Convite não encontrado');
          setLoading(false);
          return;
        }

        setDados(data);
      } catch (err) {
        setErro('Erro ao carregar convite');
      } finally {
        setLoading(false);
      }
    }

    buscarDados();
  }, [token]);

  const handleAceitar = async () => {
    setAceitando(true);
    try {
      if (!session) {
        router.push(`/login?redirect=${encodeURIComponent(`/convite/${token}`)}`);
        return;
      }

      const res = await fetchAPI('/api/convite/aceitar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao aceitar convite');
        setAceitando(false);
        return;
      }

      router.push(data.redirect_url || '/painel');
    } catch (err) {
      setErro('Erro ao processar convite');
      setAceitando(false);
    }
  };

  const handleCriarConta = () => {
    router.push(`/cadastro?redirect=${encodeURIComponent(`/convite/${token}`)}`);
  };

  const handleJaTenhoConta = () => {
    router.push(`/login?redirect=${encodeURIComponent(`/convite/${token}`)}`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando convite...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)', padding: 'var(--space-4)' }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="alertCircle" size={48} color="var(--color-danger)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-4)' }}>
            {erro}
          </h2>
          <Button variant="primary" onClick={() => router.push('/')} style={{ marginTop: 'var(--space-6)' }}>
            Voltar para o início
          </Button>
        </div>
      </div>
    );
  }

  if (dados?.status === 'ja_confirmado') {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)', padding: 'var(--space-4)' }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="checkCircle" size={48} color="var(--color-success)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-4)' }}>
            Este convite já foi aceito
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            O casal já confirmou a participação neste evento.
          </p>
          <Button variant="primary" onClick={() => router.push('/login')} style={{ marginTop: 'var(--space-6)' }}>
            Acessar minha conta
          </Button>
        </div>
      </div>
    );
  }

  const evento = dados?.evento;
  const cerimonialista = dados?.cerimonialista;

  return (
    <>
      <Head>
        <title>Convite — Descomplicaí</title>
      </Head>

      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
            maxWidth: '480px',
            width: '100%',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-brand-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            <Icon name="mailOpen" size={32} color="var(--color-brand)" />
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-text-primary)',
              marginTop: 'var(--space-5)',
            }}
          >
            Você foi convidado
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-3)' }}>
            <strong style={{ color: 'var(--color-brand)' }}>{cerimonialista?.nome_empresa || 'Um cerimonialista'}</strong> gostaria de organizar o seu evento.
          </p>

          <div
            style={{
              backgroundColor: 'var(--color-off-white)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              marginTop: 'var(--space-6)',
              textAlign: 'left',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)',
              }}
            >
              Detalhes do evento
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {evento?.nome_evento && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Icon name="tag" size={16} color="var(--color-text-muted)" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    {evento.nome_evento}
                  </span>
                </div>
              )}
              {evento?.data_evento && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Icon name="calendar" size={16} color="var(--color-text-muted)" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    {new Date(evento.data_evento + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              )}
              {evento?.cidade && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Icon name="mapPin" size={16} color="var(--color-text-muted)" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    {evento.cidade}
                  </span>
                </div>
              )}
              {cerimonialista?.cidade && cerimonialista?.estado && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Icon name="building" size={16} color="var(--color-text-muted)" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    {cerimonialista.cidade} / {cerimonialista.estado}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {session ? (
              <Button variant="primary" fullWidth onClick={handleAceitar} disabled={aceitando}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                  {aceitando ? (
                    <>
                      <Icon name="refreshCw" size={16} />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Icon name="checkCircle" size={16} />
                      Aceitar convite e começar meu memorial
                    </>
                  )}
                </span>
              </Button>
            ) : (
              <>
                <Button variant="primary" fullWidth onClick={handleCriarConta}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                    <Icon name="userPlus" size={16} />
                    Criar conta para aceitar
                  </span>
                </Button>
                <Button variant="secondary" fullWidth onClick={handleJaTenhoConta}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                    <Icon name="user" size={16} />
                    Já tenho conta
                  </span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
