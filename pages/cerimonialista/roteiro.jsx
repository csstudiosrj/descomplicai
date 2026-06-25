import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import RoteiroTimeline from '../../components/cerimonialista/RoteiroTimeline';
import RoteiroForm from '../../components/cerimonialista/RoteiroForm';
import { supabase } from '../../lib/supabase';

export default function RoteiroPage() {
  const router = useRouter();
  const { user, loading, cerimonialista, isCerimonialista } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [toast, setToast] = useState(null);

  // Proteção de rota
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && !isCerimonialista) {
      router.push('/painel');
    }
  }, [loading, user, isCerimonialista, router]);

  // Buscar eventos do cerimonialista
  useEffect(() => {
    async function buscarEventos() {
      if (!cerimonialista?.id) return;

      const { data, error } = await supabase
        .from('eventos')
        .select('id, nome_evento, data_evento, cerimonialista_id, casal_confirmado')
        .eq('cerimonialista_id', cerimonialista.id)
        .eq('casal_confirmado', true)
        .order('data_evento', { ascending: true });

      if (!error && data) {
        setEventos(data);
        if (data.length > 0 && !eventoSelecionado) {
          setEventoSelecionado(data[0].id);
        }
      }
      setCarregando(false);
    }

    if (isCerimonialista && cerimonialista) {
      buscarEventos();
    }
  }, [isCerimonialista, cerimonialista, eventoSelecionado]);

  // Buscar roteiro do evento selecionado
  useEffect(() => {
    async function buscarRoteiro() {
      if (!eventoSelecionado) {
        setItens([]);
        return;
      }

      setCarregando(true);
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        const res = await fetch(`/api/cerimonialista/roteiro?evento_id=${eventoSelecionado}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setItens(data.itens || []);
        } else {
          setItens([]);
        }
      } catch (err) {
        console.error('Erro ao buscar roteiro:', err);
        setItens([]);
      } finally {
        setCarregando(false);
      }
    }

    buscarRoteiro();
  }, [eventoSelecionado]);

  const mostrarToast = useCallback((mensagem, tipo = 'success') => {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleGerarAutomatico = async () => {
    if (!eventoSelecionado) return;
    setGerando(true);

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/cerimonialista/roteiro?acao=gerar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ evento_id: eventoSelecionado }),
      });

      if (res.ok) {
        const data = await res.json();
        setItens(data.itens || []);
        mostrarToast(`Roteiro gerado com ${data.itens_criados} itens.`);
      } else {
        const err = await res.json();
        mostrarToast(err.erro || 'Erro ao gerar roteiro.', 'error');
      }
    } catch (err) {
      mostrarToast('Erro de conexão.', 'error');
    } finally {
      setGerando(false);
    }
  };

  const handleSaveItem = async (dados) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const url = '/api/cerimonialista/roteiro';
    const method = dados.id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.erro || 'Erro ao salvar.');
    }

    const saved = await res.json();

    if (dados.id) {
      setItens((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
      mostrarToast('Item atualizado.');
    } else {
      setItens((prev) => [...prev, saved].sort((a, b) => a.ordem - b.ordem || a.horario.localeCompare(b.horario)));
      mostrarToast('Item adicionado.');
    }

    setModalAberto(false);
    setItemEditando(null);
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const res = await fetch(`/api/cerimonialista/roteiro?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setItens((prev) => prev.filter((i) => i.id !== id).map((i, idx) => ({ ...i, ordem: idx + 1 })));
      mostrarToast('Item excluído.');
    } else {
      mostrarToast('Erro ao excluir.', 'error');
    }
  };

  const handleStatusChange = async (id, novoStatus) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const res = await fetch('/api/cerimonialista/roteiro', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, status: novoStatus }),
    });

    if (res.ok) {
      const updated = await res.json();
      setItens((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    }
  };

  const handleMoveUp = async (index) => {
    if (index <= 0) return;
    const newItens = [...itens];
    [newItens[index - 1], newItens[index]] = [newItens[index], newItens[index - 1]];

    // Atualizar ordem no banco
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    await Promise.all([
      fetch('/api/cerimonialista/roteiro', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: newItens[index - 1].id, ordem: index }),
      }),
      fetch('/api/cerimonialista/roteiro', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: newItens[index].id, ordem: index + 1 }),
      }),
    ]);

    setItens(newItens.map((i, idx) => ({ ...i, ordem: idx + 1 })));
  };

  const handleMoveDown = async (index) => {
    if (index >= itens.length - 1) return;
    const newItens = [...itens];
    [newItens[index], newItens[index + 1]] = [newItens[index + 1], newItens[index]];

    const token = (await supabase.auth.getSession()).data.session?.access_token;
    await Promise.all([
      fetch('/api/cerimonialista/roteiro', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: newItens[index].id, ordem: index + 1 }),
      }),
      fetch('/api/cerimonialista/roteiro', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: newItens[index + 1].id, ordem: index + 2 }),
      }),
    ]);

    setItens(newItens.map((i, idx) => ({ ...i, ordem: idx + 1 })));
  };

  const eventoAtual = eventos.find((e) => e.id === eventoSelecionado);

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando...</p>
      </div>
    );
  }

  if (!isCerimonialista || !cerimonialista) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)', padding: 'var(--space-4)' }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="alertCircle" size={48} color="var(--color-warning)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-4)' }}>
            Acesso restrito
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            Esta área é exclusiva para cerimonialistas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Roteiro do Evento — Descomplicaí</title>
      </Head>

      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)' }}>
        {/* Header */}
        <header
          style={{
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            padding: 'var(--space-4) var(--space-5)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <button
                onClick={() => router.push('/cerimonialista/painel')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 'var(--space-1)' }}
                aria-label="Voltar ao painel"
              >
                <Icon name="arrowLeft" size={22} />
              </button>
              <div>
                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-xl)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}
                >
                  Roteiro do Evento
                </h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0, marginTop: 'var(--space-1)' }}>
                  Timeline hora a hora
                </p>
              </div>
            </div>

            {/* Seletor de evento */}
            {eventos.length > 0 && (
              <select
                value={eventoSelecionado || ''}
                onChange={(e) => setEventoSelecionado(e.target.value)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: '200px',
                }}
                aria-label="Selecionar evento"
              >
                {eventos.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome_evento || 'Evento sem nome'} — {e.data_evento ? new Date(e.data_evento).toLocaleDateString('pt-BR') : 'Sem data'}
                  </option>
                ))}
              </select>
            )}
          </div>
        </header>

        {/* Conteúdo */}
        <main style={{ maxWidth: '960px', margin: '0 auto', padding: 'var(--space-5)' }}>
          {/* Info do evento */}
          {eventoAtual && (
            <div
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                border: '1px solid var(--color-border)',
                marginBottom: 'var(--space-5)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-brand-lighter)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="calendar" size={20} color="var(--color-brand)" />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)', margin: 0 }}>
                  {eventoAtual.nome_evento || 'Evento'}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0, marginTop: 'var(--space-1)' }}>
                  {eventoAtual.data_evento ? new Date(eventoAtual.data_evento).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Data não definida'}
                </p>
              </div>
            </div>
          )}

          {/* Ações */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-5)',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="primary"
              onClick={() => {
                setItemEditando(null);
                setModalAberto(true);
              }}
              disabled={!eventoSelecionado}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Icon name="plus" size={16} />
                Novo item
              </span>
            </Button>

            <Button
              variant="secondary"
              onClick={handleGerarAutomatico}
              disabled={!eventoSelecionado || gerando || itens.length > 0}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Icon name="play" size={16} />
                {gerando ? 'Gerando...' : 'Gerar automaticamente'}
              </span>
            </Button>
          </div>

          {/* Estado vazio — sem eventos */}
          {eventos.length === 0 && !carregando && (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-12) var(--space-5)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--color-border-strong)',
              }}
            >
              <Icon name="calendar" size={40} color="var(--color-text-muted)" />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-4)' }}>
                Nenhum evento confirmado ainda.
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                Converta um lead em evento e aguarde a confirmação do casal para gerar o roteiro.
              </p>
            </div>
          )}

          {/* Timeline */}
          {eventoSelecionado && (
            <RoteiroTimeline
              itens={itens}
              onEdit={(item) => {
                setItemEditando(item);
                setModalAberto(true);
              }}
              onDelete={handleDeleteItem}
              onStatusChange={handleStatusChange}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          )}
        </main>
      </div>

      {/* Modal */}
      {modalAberto && (
        <RoteiroForm
          item={itemEditando}
          eventoId={eventoSelecionado}
          onSave={handleSaveItem}
          onCancel={() => {
            setModalAberto(false);
            setItemEditando(null);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 'var(--space-5)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 'var(--z-toast)',
            padding: 'var(--space-3) var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: toast.tipo === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
            backgroundColor: toast.tipo === 'error' ? 'var(--color-danger-light)' : 'var(--color-success-light)',
            border: `1px solid ${toast.tipo === 'error' ? 'var(--color-danger)' : 'var(--color-success)'}`,
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            animation: 'fadeInUp 300ms ease',
          }}
          role="status"
        >
          <Icon name={toast.tipo === 'error' ? 'alertCircle' : 'checkCircle'} size={16} />
          {toast.mensagem}
        </div>
      )}
    </>
  );
}
