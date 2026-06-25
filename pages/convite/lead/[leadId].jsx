import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';

export default function PaginaConviteLead() {
  const router = useRouter();
  const { leadId } = router.query;
  const [lead, setLead] = useState(null);
  const [cerimonialista, setCerimonialista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [aceitando, setAceitando] = useState(false);
  const [aceito, setAceito] = useState(false);

  useEffect(() => {
    if (!leadId) return;

    async function buscarDados() {
      try {
        const res = await fetch(`/api/cerimonialista/convites?leadId=${leadId}`);
        const data = await res.json();

        if (!res.ok || !data.lead) {
          setErro(data.error || 'Convite não encontrado');
          setLoading(false);
          return;
        }

        setLead(data.lead);
        setCerimonialista(data.cerimonialista);
      } catch (err) {
        setErro('Erro ao carregar convite');
      } finally {
        setLoading(false);
      }
    }

    buscarDados();
  }, [leadId]);

  const handleAceitar = async () => {
    setAceitando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push(`/login?redirect=${encodeURIComponent(`/convite/lead/${leadId}`)}`);
        return;
      }

      const res = await fetch('/api/cerimonialista/convites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao aceitar convite');
        setAceitando(false);
        return;
      }

      setAceito(true);
      setTimeout(() => {
        router.push('/painel');
      }, 2000);
    } catch (err) {
      setErro('Erro ao processar convite');
      setAceitando(false);
    }
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

  if (aceito) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)', padding: 'var(--space-4)' }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="checkCircle" size={48} color="var(--color-success)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-4)' }}>
            Convite aceito com sucesso!
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            Redirecionando para o painel...
          </p>
        </div>
      </div>
    );
  }

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
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Icon name="user" size={16} color="var(--color-text-muted)" />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  {lead.nome_lead}
                </span>
              </div>
              {lead.tipo_evento && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Icon name="tag" size={16} color="var(--color-text-muted)" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    {lead.tipo_evento}
                  </span>
                </div>
              )}
              {lead.data_prevista && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Icon name="calendar" size={16} color="var(--color-text-muted)" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    {new Date(lead.data_prevista + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              )}
              {lead.valor_proposta && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Icon name="dollar" size={16} color="var(--color-text-muted)" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-medium)' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.valor_proposta)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
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
                    Aceitar convite
                  </>
                )}
              </span>
            </Button>
            <Button variant="secondary" fullWidth onClick={() => router.push('/')}>
              Recusar e voltar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
